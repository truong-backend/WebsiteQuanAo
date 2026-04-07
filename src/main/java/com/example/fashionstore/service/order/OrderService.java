package com.example.fashionstore.service.order;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.order.CreateOrderRequest;
import com.example.fashionstore.dto.order.OrderDto;
import com.example.fashionstore.dto.order.OrderFilterDto;
import com.example.fashionstore.mapper.order.OrderMapper;
import com.example.fashionstore.module.order.Order;
import com.example.fashionstore.module.order.OrderItem;
import com.example.fashionstore.module.order.Payment;
import com.example.fashionstore.repository.cart.CartRepository;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final CartRepository           cartRepository;
    private final OrderMapper orderMapper;

    // ── Tạo đơn hàng ────────────────────────────────────────────────

    /**
     * User tạo đơn hàng.
     * Luồng: validate items → trừ kho → tạo Order + OrderItems + Payment
     */
    public OrderDto createOrder(CreateOrderRequest req) {
        User user = SecurityUtils.getCurrentUser();

        // 1. Validate và load variants
        List<OrderItemData> itemDataList = new ArrayList<>();
        for (var itemReq : req.getItems()) {
            ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", itemReq.getVariantId()));

            if (variant.getQuantity() < itemReq.getQuantity())
                throw new BusinessException(
                        "Sản phẩm '" + variant.getProduct().getName()
                                + " - " + variant.getVariantInfo() + "' chỉ còn " + variant.getQuantity() + " cái"
                );
            itemDataList.add(new OrderItemData(variant, itemReq.getQuantity()));
        }

        // 2. Tính tiền
        BigDecimal subtotal = itemDataList.stream()
                .map(d -> d.variant().getProduct().getEffectivePrice()
                        .multiply(BigDecimal.valueOf(d.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = calculateShipping(subtotal);
        BigDecimal total       = subtotal.add(shippingFee);

        // 3. Tạo Order
        String orderId = UUID.randomUUID().toString();
        Order order = Order.builder()
                .id(orderId)
                .user(user)
                .phoneNumber(req.getPhoneNumber().trim())
                .shippingAddress(req.getShippingAddress().trim())
                .note(req.getNote())
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .build();

        // 4. Tạo OrderItems (snapshot)
        List<OrderItem> orderItems = itemDataList.stream()
                .map(d -> {
                    var product = d.variant().getProduct();
                    return OrderItem.builder()
                            .id(UUID.randomUUID().toString())
                            .order(order)
                            .productVariant(d.variant())
                            .productName(product.getName())                    // snapshot
                            .variantInfo(d.variant().getVariantInfo())         // snapshot
                            .imageUrl(d.variant().getImageUrl() != null
                                    ? d.variant().getImageUrl() : product.getMainImage()) // snapshot
                            .unitPrice(product.getEffectivePrice())            // snapshot
                            .quantity(d.quantity())
                            .build();
                })
                .toList();

        order.setItems(orderItems);

        // 5. Tạo Payment
        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .method(Payment.PaymentMethod.valueOf(req.getPaymentMethod()))
                .status(Payment.PaymentStatus.PENDING)
                .amount(total)
                .build();

        order.setPayment(payment);

        // 6. Trừ tồn kho
        itemDataList.forEach(d -> {
            d.variant().setQuantity(d.variant().getQuantity() - d.quantity());
            variantRepository.save(d.variant());
        });

        // 7. Xóa cart nếu user checkout từ cart
        if (req.isClearCart() && user != null) {
            cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
                cart.getItems().clear();
                cartRepository.save(cart);
            });
        }

        Order saved = orderRepository.save(order);
        return orderMapper.toDto(saved);
    }

    // ── Hủy đơn ─────────────────────────────────────────────────────

    /** User chỉ được hủy khi status = PENDING */
    public OrderDto cancelOrder(String orderId) {
        User user = SecurityUtils.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Verify ownership
        if (order.getUser() == null || !order.getUser().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền hủy đơn này");

        if (order.getStatus() != Order.OrderStatus.PENDING)
            throw new BusinessException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");

        order.setStatus(Order.OrderStatus.CANCELLED);

        // Hoàn trả tồn kho
        order.getItems().forEach(item -> {
            ProductVariant variant = item.getProductVariant();
            variant.setQuantity(variant.getQuantity() + item.getQuantity());
            variantRepository.save(variant);
        });

        return orderMapper.toDto(orderRepository.save(order));
    }

    // ── Admin queries ────────────────────────────────────────────────

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderDto> findAll(Pageable pageable, OrderFilterDto filter) {
        Specification<Order> spec = OrderSpec.build(filter);
        return orderRepository.findAll(spec, pageable).map(orderMapper::toDto);
    }

    /** Lấy chi tiết đơn theo id */
    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderDto getById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return orderMapper.toDto(order);
    }

    /** Lịch sử đơn hàng của user hiện tại */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrderDto> getMyOrders() {
        User user = SecurityUtils.getCurrentUser();
        return orderRepository.findByUserIdOrderByOrderTimeDesc(user.getId())
                .stream().map(orderMapper::toDto).toList();
    }

    /** Admin cập nhật trạng thái */
    public OrderDto updateStatus(String orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return orderMapper.toDto(orderRepository.save(order));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    /** Freeship khi đơn >= 500k */
    private BigDecimal calculateShipping(BigDecimal subtotal) {
        return subtotal.compareTo(new BigDecimal("500000")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("30000");
    }

    /** Validate chuyển trạng thái hợp lệ */
    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        // CANCELLED không thể chuyển về bất cứ trạng thái nào
        if (current == Order.OrderStatus.CANCELLED || current == Order.OrderStatus.REFUNDED)
            throw new BusinessException("Không thể cập nhật đơn hàng ở trạng thái " + current);
        // DELIVERED chỉ có thể → REFUNDED
        if (current == Order.OrderStatus.DELIVERED && next != Order.OrderStatus.REFUNDED)
            throw new BusinessException("Đơn đã giao chỉ có thể chuyển sang REFUNDED");
    }

    private record OrderItemData(ProductVariant variant, int quantity) {}
}