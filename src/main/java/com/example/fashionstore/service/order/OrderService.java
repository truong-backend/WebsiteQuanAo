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
import com.example.fashionstore.messaging.dto.OrderCreatedMessage;
import com.example.fashionstore.messaging.dto.OrderStatusChangedMessage;
import com.example.fashionstore.messaging.publisher.MessagePublisher;
import com.example.fashionstore.service.inventory.InventoryService;
import com.example.fashionstore.service.voucher.VoucherService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * OrderService — Transaction + Deadlock prevention
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TRANSACTION (ACID):                                             ║
 * ║  - Atomicity: createOrder() là 1 đơn vị, fail → rollback toàn bộ║
 * ║  - Consistency: stock không bao giờ âm (check + lock)           ║
 * ║  - Isolation: PESSIMISTIC_WRITE lock variant → chống oversell   ║
 * ║  - Durability: sau commit, dữ liệu persist xuống disk           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  DEADLOCK prevention:                                            ║
 * ║  - Luôn lock variant theo thứ tự ID tăng dần (consistent order) ║
 * ║  - Ví dụ: User A mua variant[1,2], User B mua variant[2,1]      ║
 * ║    → nếu lock theo thứ tự khác nhau → deadlock                  ║
 * ║  - Fix: sort variantId trước khi lock → cả 2 user lock [1] trước║
 * ║  - Spring @Transactional timeout = 30s → tránh deadlock vô hạn  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  STACK vs HEAP:                                                  ║
 * ║  - itemDataList: cấp phát trên HEAP, tồn tại trong transaction   ║
 * ║  - Sau method kết thúc → GC thu hồi (không cần manual free)     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
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
    private final MessagePublisher         messagePublisher;

    // ── Tạo đơn hàng ────────────────────────────────────────────────

    /**
     * createOrder() — Transaction với Pessimistic Lock chống oversell
     *
     * DEADLOCK FIX: sort variantId trước khi lock
     * Nếu 2 user cùng mua [v1, v2] và [v2, v1]:
     *   - Không sort → User A lock v1 chờ v2; User B lock v2 chờ v1 → DEADLOCK
     *   - Có sort    → cả 2 đều lock v1 trước → v2 sau → không deadlock
     *
     * ArrayList: O(1) add/get, phù hợp duyệt tuần tự ở đây
     * LinkedList sẽ tốt hơn nếu cần insert/delete giữa list thường xuyên
     */
    public OrderDto createOrder(CreateOrderRequest req) {
        User user = SecurityUtils.getCurrentUser();

        // ─── DEADLOCK PREVENTION: sort theo variantId trước khi lock ───
        // Đây là "consistent lock ordering" — nguyên tắc vàng tránh deadlock
        var sortedItems = req.getItems().stream()
                .sorted(Comparator.comparing(CreateOrderRequest.OrderItemRequest::getVariantId))
                .toList();

        // 1. Lock variants và validate stock
        // ArrayList<OrderItemData>: cấp phát trên HEAP, GC quản lý
        List<OrderItemData> itemDataList = new ArrayList<>();
        for (var itemReq : sortedItems) {
            // PESSIMISTIC_WRITE lock: SELECT ... FOR UPDATE
            // → ngăn transaction khác đọc/ghi variant này cho đến khi commit
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
            appliedVoucher = voucherRepository.findByIdForUpdate(req.getVoucherId())
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

        // 5. Tạo OrderItems (price snapshot — NF2: giá tại thời điểm mua, không phụ thuộc vào product.price sau này)
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

        // ── Publish event: QUEUE (RabbitMQ) — FIFO
        // Queue đảm bảo email được gửi đúng thứ tự, không mất khi consumer chậm
        messagePublisher.publishOrderCreated(
                OrderCreatedMessage.builder()
                        .orderId(saved.getId())
                        .customerEmail(user.getEmail())
                        .customerName(user.getName())
                        .totalAmount(total)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

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
        String oldStatus = order.getStatus().name();
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
            Order saved = orderRepository.save(order);

        if (order.getUser() != null) {
            messagePublisher.publishOrderStatusChanged(
                    OrderStatusChangedMessage.builder()
                            .orderId(orderId)
                            .customerEmail(order.getUser().getEmail())
                            .customerName(order.getUser().getName())
                            .oldStatus(oldStatus)
                            .newStatus(newStatus.name())
                            .changedAt(LocalDateTime.now())
                            .build()
            );
        }

        return orderMapper.toDto(saved);
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