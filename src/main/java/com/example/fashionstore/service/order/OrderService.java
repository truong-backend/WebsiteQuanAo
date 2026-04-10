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
import com.example.fashionstore.module.voucher.Voucher;
import com.example.fashionstore.repository.cart.CartRepository;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import com.example.fashionstore.repository.voucher.VoucherRepository;
import com.example.fashionstore.service.inventory.InventoryService;
import com.example.fashionstore.service.voucher.VoucherService;
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

    private final OrderRepository          orderRepository;
    private final ProductVariantRepository variantRepository;
    private final CartRepository           cartRepository;
    private final VoucherRepository        voucherRepository;
    private final VoucherService           voucherService;
    private final InventoryService         inventoryService;
    private final OrderMapper              orderMapper;

    // ── Tạo đơn hàng ────────────────────────────────────────────────

    /**
     * Tạo đơn hàng với:
     * - Pessimistic lock variant (chống oversell)
     * - Re-check stock sau khi lock
     * - Ghi inventory log (EXPORT_SALE)
     * - Áp dụng voucher (nếu có)
     */
    public OrderDto createOrder(CreateOrderRequest req) {
        User user = SecurityUtils.getCurrentUser();

        // 1. Lock variants và validate stock
        List<OrderItemData> itemDataList = new ArrayList<>();
        for (var itemReq : req.getItems()) {
            ProductVariant variant = variantRepository.findByIdForUpdate(itemReq.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", itemReq.getVariantId()));

            if (variant.getQuantity() < itemReq.getQuantity())
                throw new BusinessException(
                        "Sản phẩm '" + variant.getProduct().getName()
                                + " - " + variant.getVariantInfo() + "' chỉ còn " + variant.getQuantity() + " cái"
                );

            if (!variant.getProduct().isActive())
                throw new BusinessException("Sản phẩm '" + variant.getProduct().getName() + "' hiện không còn bán");

            itemDataList.add(new OrderItemData(variant, itemReq.getQuantity()));
        }

        // 2. Tính tiền
        BigDecimal subtotal = itemDataList.stream()
                .map(d -> d.variant().getProduct().getEffectivePrice()
                        .multiply(BigDecimal.valueOf(d.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = calculateShipping(subtotal);

        // 3. Áp dụng voucher
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher appliedVoucher = null;

        if (req.getVoucherId() != null) {
            appliedVoucher = voucherRepository.findById(req.getVoucherId())
                    .orElseThrow(() -> new BusinessException("Voucher không tồn tại"));

            if (!appliedVoucher.isValid())
                throw new BusinessException("Voucher đã hết hạn hoặc đã sử dụng hết");

            if (subtotal.compareTo(appliedVoucher.getMinOrderAmount()) < 0)
                throw new BusinessException(
                        "Đơn hàng phải từ " + appliedVoucher.getMinOrderAmount() + "₫ để dùng voucher này"
                );

            discountAmount = appliedVoucher.calculateDiscount(subtotal, shippingFee);
        }

        BigDecimal total = subtotal.add(shippingFee).subtract(discountAmount).max(BigDecimal.ZERO);

        // 4. Tạo Order
        String orderId = UUID.randomUUID().toString();
        Order order = Order.builder()
                .id(orderId)
                .user(user)
                .phoneNumber(req.getPhoneNumber().trim())
                .shippingAddress(req.getShippingAddress().trim())
                .note(req.getNote())
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .build();

        // 5. Tạo OrderItems (price snapshot)
        List<OrderItem> orderItems = itemDataList.stream()
                .map(d -> {
                    var product = d.variant().getProduct();
                    return OrderItem.builder()
                            .id(UUID.randomUUID().toString())
                            .order(order)
                            .productVariant(d.variant())
                            .productName(product.getName())
                            .variantInfo(d.variant().getVariantInfo())
                            .imageUrl(d.variant().getImageUrl() != null
                                    ? d.variant().getImageUrl() : product.getMainImage())
                            .unitPrice(product.getEffectivePrice())
                            .quantity(d.quantity())
                            .build();
                })
                .toList();

        order.setItems(orderItems);

        // 6. Tạo Payment
        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .method(Payment.PaymentMethod.valueOf(req.getPaymentMethod()))
                .status(Payment.PaymentStatus.PENDING)
                .amount(total)
                .build();

        order.setPayment(payment);

        // 7. Trừ kho + ghi inventory log EXPORT_SALE
        itemDataList.forEach(d -> {
            int newQty = d.variant().getQuantity() - d.quantity();
            d.variant().setQuantity(newQty);
            variantRepository.save(d.variant());
            // Ghi log xuất kho
            inventoryService.logSale(d.variant(), d.quantity(), newQty, orderId);
        });

        // 8. Tăng usedCount voucher
        if (appliedVoucher != null) {
            voucherService.incrementUsage(appliedVoucher.getId());
        }

        // 9. Xóa cart
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

    public OrderDto cancelOrder(String orderId) {
        User user = SecurityUtils.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền hủy đơn này");

        if (order.getStatus() != Order.OrderStatus.PENDING)
            throw new BusinessException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");

        order.setStatus(Order.OrderStatus.CANCELLED);

        // Hoàn trả kho + ghi inventory log RETURN
        order.getItems().forEach(item -> {
            ProductVariant variant = item.getProductVariant();
            int newQty = variant.getQuantity() + item.getQuantity();
            variant.setQuantity(newQty);
            variantRepository.save(variant);
            inventoryService.logReturn(variant, item.getQuantity(), newQty, orderId);
        });

        return orderMapper.toDto(orderRepository.save(order));
    }

    // ── Queries ──────────────────────────────────────────────────────

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderDto> findAll(Pageable pageable, OrderFilterDto filter) {
        Specification<Order> spec = OrderSpec.build(filter);
        return orderRepository.findAll(spec, pageable).map(orderMapper::toDto);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderDto getById(String orderId) {
        return orderMapper.toDto(orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId)));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrderDto> getMyOrders() {
        User user = SecurityUtils.getCurrentUser();
        return orderRepository.findByUserIdOrderByOrderTimeDesc(user.getId())
                .stream().map(orderMapper::toDto).toList();
    }

    public OrderDto updateStatus(String orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return orderMapper.toDto(orderRepository.save(order));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private BigDecimal calculateShipping(BigDecimal subtotal) {
        return subtotal.compareTo(new BigDecimal("500000")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("30000");
    }

    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        if (current == Order.OrderStatus.CANCELLED || current == Order.OrderStatus.REFUNDED)
            throw new BusinessException("Không thể cập nhật đơn hàng ở trạng thái " + current);
        if (current == Order.OrderStatus.DELIVERED
                && next != Order.OrderStatus.REFUNDED
                && next != Order.OrderStatus.COMPLETED)
            throw new BusinessException("Đơn đã giao chỉ có thể chuyển sang COMPLETED hoặc REFUNDED");
    }

    private record OrderItemData(ProductVariant variant, int quantity) {}
}