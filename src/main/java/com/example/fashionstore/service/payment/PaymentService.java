package com.example.fashionstore.service.payment;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.payment.PaymentDto;
import com.example.fashionstore.dto.payment.VNPayCreateResponse;
import com.example.fashionstore.module.order.Order;
import com.example.fashionstore.module.order.Payment;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.repository.order.PaymentRepository;
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

    private final PaymentRepository paymentRepository;
    private final OrderRepository   orderRepository;
    private final VNPayService      vnPayService;

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

    /**
     * Tạo URL thanh toán VNPay cho đơn hàng.
     * Đơn phải ở trạng thái PENDING và payment method = VNPAY.
     */
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

    /**
     * Xử lý khi VNPay redirect user về ReturnUrl.
     * Trả về URL redirect về frontend kèm query params result.
     */
    public String handleVNPayReturn(Map<String, String> params) {
        boolean validChecksum = vnPayService.verifyChecksum(params);
        String responseCode   = vnPayService.getResponseCode(params);
        String txnRef         = vnPayService.getTxnRef(params);   // payment.id (truncated)
        String transactionId  = vnPayService.getTransactionId(params);

        log.info("VNPay return: txnRef={}, responseCode={}, checksum={}", txnRef, responseCode, validChecksum);

        if (!validChecksum) {
            return frontendReturnUrl + "?status=INVALID_CHECKSUM&orderId=";
        }

        // Tìm payment gần nhất khớp với txnRef prefix
        paymentRepository.findAll().stream()
                .filter(p -> p.getId().replace("-", "").toUpperCase()
                        .startsWith(txnRef.toUpperCase()))
                .findFirst()
                .ifPresent(payment -> {
                    if (payment.getStatus() != Payment.PaymentStatus.PAID) {
                        if ("00".equals(responseCode)) {
                            markPaid(payment, transactionId, params.toString());
                        } else {
                            payment.setStatus(Payment.PaymentStatus.FAILED);
                            payment.setRawResponse(params.toString());
                            paymentRepository.save(payment);
                        }
                    }
                });

        String status = "00".equals(responseCode) ? "SUCCESS" : "FAILED";
        return frontendReturnUrl + "?status=" + status + "&vnp_ResponseCode=" + responseCode;
    }

    // ── VNPay IPN (server-to-server callback) ───────────────────────

    /**
     * Xử lý IPN từ VNPay server.
     * Phải trả về { "RspCode": "00", "Message": "Confirm Success" } cho VNPay.
     */
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
                        payment.setStatus(Payment.PaymentStatus.FAILED);
                        payment.setRawResponse(params.toString());
                        paymentRepository.save(payment);
                        return Map.of("RspCode", "00", "Message", "Confirm Success");
                    }
                })
                .orElse(Map.of("RspCode", "01", "Message", "Order not found"));
    }

    // ── COD – confirm payment manually (Admin) ───────────────────────

    /**
     * Admin xác nhận thanh toán COD khi giao hàng thành công.
     */
    public PaymentDto confirmCodPayment(String orderId) {
        Order order = findOrderOrThrow(orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        if (payment.getMethod() != Payment.PaymentMethod.COD)
            throw new BusinessException("Chỉ áp dụng cho phương thức COD");

        if (payment.getStatus() == Payment.PaymentStatus.PAID)
            throw new BusinessException("Đơn hàng đã được thanh toán");

        markPaid(payment, "COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(), null);

        // Tự động chuyển order sang DELIVERED
        if (order.getStatus() == Order.OrderStatus.SHIPPING) {
            order.setStatus(Order.OrderStatus.DELIVERED);
            orderRepository.save(order);
        }

        return toDto(payment);
    }

    // ── Refund (Admin) ───────────────────────────────────────────────

    /**
     * Admin đánh dấu refund — hệ thống này không tự động refund VNPay.
     * Refund thực tế cần xử lý qua VNPay Merchant Portal.
     */
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

        // Tự động chuyển order sang CONFIRMED
        Order order = payment.getOrder();
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
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
            // Guest checkout hoặc unauthenticated — allow read for return URL flow
        }
    }

    private void authorizeOrderAccess(Order order) {
        User user = SecurityUtils.getCurrentUser();
        if (user.getRole() == User.Role.ROLE_ADMIN) return;
        if (order.getUser() == null || !order.getUser().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền thực hiện thanh toán cho đơn này");
    }

    private Order findOrderOrThrow(String orderId) {
        return orderRepository.findById(orderId)
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