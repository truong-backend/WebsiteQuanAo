package com.example.fashionstore.service.payment;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.payment.PaymentDto;
import com.example.fashionstore.dto.payment.VNPayCreateResponse;
import com.example.fashionstore.module.order.Order;
import com.example.fashionstore.module.order.Payment;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.repository.order.PaymentRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import com.example.fashionstore.service.inventory.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentService {

    private final PaymentRepository        paymentRepository;
    private final OrderRepository          orderRepository;
    private final VNPayService             vnPayService;
    private final ProductVariantRepository variantRepository;  // FIX: inject để hoàn kho
    private final InventoryService         inventoryService;   // FIX: inject để ghi log hoàn kho

    @Value("${vnpay.frontendReturnUrl}")
    private String frontendReturnUrl;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PaymentDto getByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        authorizePaymentAccess(payment);
        return toDto(payment);
    }

    @Transactional(readOnly = true)
    public PaymentDto getById(String paymentId) {
        Payment payment = findOrThrow(paymentId);
        authorizePaymentAccess(payment);
        return toDto(payment);
    }

    // ── Create VNPay payment URL ─────────────────────────────────────

    public VNPayCreateResponse createVNPayUrl(String orderId, String clientIp) {
        Order order = findOrderOrThrow(orderId);
        authorizeOrderAccess(order);

        Payment payment = getOrCreatePayment(order, Payment.PaymentMethod.VNPAY);

        if (payment.getStatus() == Payment.PaymentStatus.PAID)
            throw new BusinessException("Đơn hàng này đã được thanh toán");

        String orderInfo = "Thanh toan don hang " + orderId.substring(0, 8).toUpperCase();
        String paymentUrl = vnPayService.createPaymentUrl(
                payment.getId(),
                payment.getAmount(),
                orderInfo,
                clientIp
        );

        return VNPayCreateResponse.builder()
                .paymentId(payment.getId())
                .orderId(orderId)
                .paymentUrl(paymentUrl)
                .method("VNPAY")
                .build();
    }

    // ── VNPay Return URL (user redirect back) ───────────────────────

    public String handleVNPayReturn(Map<String, String> params) {
        boolean validChecksum = vnPayService.verifyChecksum(params);
        String responseCode   = vnPayService.getResponseCode(params);
        String txnRef         = vnPayService.getTxnRef(params);
        String transactionId  = vnPayService.getTransactionId(params);

        log.info("VNPay return: txnRef={}, responseCode={}, checksum={}", txnRef, responseCode, validChecksum);

        if (!validChecksum) {
            return frontendReturnUrl + "?status=INVALID_CHECKSUM&orderId=";
        }

        paymentRepository.findAll().stream()
                .filter(p -> p.getId().replace("-", "").toUpperCase()
                        .startsWith(txnRef.toUpperCase()))
                .findFirst()
                .ifPresent(payment -> {
                    if (payment.getStatus() != Payment.PaymentStatus.PAID) {
                        if ("00".equals(responseCode)) {
                            markPaid(payment, transactionId, params.toString());
                        } else {
                            // FIX: hoàn kho khi VNPay thất bại (timeout, huỷ, lỗi...)
                            markFailedAndRestoreStock(payment, params.toString(), responseCode);
                        }
                    }
                });

        String status = "00".equals(responseCode) ? "SUCCESS" : "FAILED";
        return frontendReturnUrl + "?status=" + status + "&vnp_ResponseCode=" + responseCode;
    }

    // ── VNPay IPN (server-to-server callback) ───────────────────────

    public Map<String, String> handleVNPayIpn(Map<String, String> params) {
        boolean validChecksum = vnPayService.verifyChecksum(params);
        if (!validChecksum) {
            log.warn("VNPay IPN invalid checksum");
            return Map.of("RspCode", "97", "Message", "Invalid Signature");
        }

        String txnRef        = vnPayService.getTxnRef(params);
        String responseCode  = vnPayService.getResponseCode(params);
        String transactionId = vnPayService.getTransactionId(params);

        return paymentRepository.findAll().stream()
                .filter(p -> p.getId().replace("-", "").toUpperCase()
                        .startsWith(txnRef.toUpperCase()))
                .findFirst()
                .map(payment -> {
                    if (payment.getStatus() == Payment.PaymentStatus.PAID) {
                        return Map.of("RspCode", "02", "Message", "Order already confirmed");
                    }
                    if ("00".equals(responseCode)) {
                        markPaid(payment, transactionId, params.toString());
                        return Map.of("RspCode", "00", "Message", "Confirm Success");
                    } else {
                        // FIX: hoàn kho khi VNPay IPN báo thất bại
                        markFailedAndRestoreStock(payment, params.toString(), responseCode);
                        return Map.of("RspCode", "00", "Message", "Confirm Success");
                    }
                })
                .orElse(Map.of("RspCode", "01", "Message", "Order not found"));
    }

    // ── COD – confirm payment manually (Admin) ───────────────────────

    public PaymentDto confirmCodPayment(String orderId) {
        Order order = findOrderOrThrow(orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        if (payment.getMethod() != Payment.PaymentMethod.COD)
            throw new BusinessException("Chỉ áp dụng cho phương thức COD");

        if (payment.getStatus() == Payment.PaymentStatus.PAID)
            throw new BusinessException("Đơn hàng đã được thanh toán");

        markPaid(payment, "COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(), null);

        if (order.getStatus() == Order.OrderStatus.SHIPPING) {
            order.setStatus(Order.OrderStatus.DELIVERED);
            orderRepository.save(order);
        }

        return toDto(payment);
    }

    // ── Refund (Admin) ───────────────────────────────────────────────

    public PaymentDto markRefunded(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        if (payment.getStatus() != Payment.PaymentStatus.PAID)
            throw new BusinessException("Chỉ có thể hoàn tiền cho đơn đã thanh toán");

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        Order order = findOrderOrThrow(orderId);
        order.setStatus(Order.OrderStatus.REFUNDED);
        orderRepository.save(order);

        return toDto(payment);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private Payment getOrCreatePayment(Order order, Payment.PaymentMethod method) {
        return paymentRepository.findByOrderId(order.getId()).orElseGet(() -> {
            Payment p = Payment.builder()
                    .id(UUID.randomUUID().toString())
                    .order(order)
                    .method(method)
                    .status(Payment.PaymentStatus.PENDING)
                    .amount(order.getTotalAmount())
                    .build();
            return paymentRepository.save(p);
        });
    }

    private void markPaid(Payment payment, String transactionId, String rawResponse) {
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setTransactionId(transactionId);
        payment.setPayTime(LocalDateTime.now());
        if (rawResponse != null) payment.setRawResponse(rawResponse);
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }
    }

    /**
     * FIX: Đánh dấu payment FAILED + huỷ order + hoàn lại số lượng kho.
     * Chỉ thực hiện nếu order vẫn đang PENDING (tránh hoàn kho 2 lần).
     */
    private void markFailedAndRestoreStock(Payment payment, String rawResponse, String responseCode) {
        // Chỉ xử lý nếu chưa từng FAILED trước đó (idempotent — IPN và Return đều có thể gọi)
        if (payment.getStatus() == Payment.PaymentStatus.FAILED) {
            log.info("Payment {} đã FAILED trước đó, bỏ qua hoàn kho", payment.getId());
            return;
        }

        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setRawResponse(rawResponse);
        paymentRepository.save(payment);

        Order order = payment.getOrder();

        // Chỉ hoàn kho nếu order vẫn PENDING (chưa bị cancel trước đó)
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Hoàn trả số lượng từng variant + ghi inventory log RETURN
            order.getItems().forEach(item -> {
                ProductVariant variant = item.getProductVariant();
                if (variant != null) {
                    int restored = variant.getQuantity() + item.getQuantity();
                    variant.setQuantity(restored);
                    variantRepository.save(variant);
                    inventoryService.logReturn(
                            variant,
                            item.getQuantity(),
                            restored,
                            order.getId()
                    );
                    log.info("Hoàn kho variant={} qty={} (VNPay responseCode={})",
                            variant.getId(), item.getQuantity(), responseCode);
                }
            });
        }
    }

    private void authorizePaymentAccess(Payment payment) {
        try {
            User user = SecurityUtils.getCurrentUser();
            if (user.getRole() == User.Role.ROLE_ADMIN) return;
            if (payment.getOrder().getUser() == null ||
                    !payment.getOrder().getUser().getId().equals(user.getId()))
                throw new BusinessException("Bạn không có quyền xem thông tin thanh toán này");
        } catch (BusinessException be) {
            throw be;
        } catch (Exception ignored) {
        }
    }

    private void authorizeOrderAccess(Order order) {
        User user = SecurityUtils.getCurrentUser();
        if (user.getRole() == User.Role.ROLE_ADMIN) return;
        if (order.getUser() == null || !order.getUser().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền thực hiện thanh toán cho đơn này");
    }

    private Order findOrderOrThrow(String orderId) {
        return orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    private Payment findOrThrow(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    public PaymentDto toDto(Payment p) {
        return PaymentDto.builder()
                .id(p.getId())
                .orderId(p.getOrder() != null ? p.getOrder().getId() : null)
                .method(p.getMethod())
                .status(p.getStatus())
                .amount(p.getAmount())
                .transactionId(p.getTransactionId())
                .payTime(p.getPayTime())
                .createdAt(p.getCreatedAt())
                .build();
    }
}