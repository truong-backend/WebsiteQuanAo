package com.example.fashionstore.service.payment;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.payment.PaymentDto;
import com.example.fashionstore.dto.payment.PayOSCreateResponse;
import com.example.fashionstore.module.order.Order;
import com.example.fashionstore.module.order.Payment;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.repository.order.PaymentRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import com.example.fashionstore.service.inventory.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentService {

    private final PaymentRepository        paymentRepository;
    private final OrderRepository          orderRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryService         inventoryService;
    private final ObjectMapper             objectMapper;

    @Value("${payos.clientId}")
    private String clientId;

    @Value("${payos.apiKey}")
    private String apiKey;

    @Value("${payos.checksumKey}")
    private String checksumKey;

    @Value("${payos.returnUrl}")
    private String returnUrl;

    @Value("${payos.cancelUrl}")
    private String cancelUrl;

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

    // ── Create PayOS payment link ────────────────────────────────────

    public PayOSCreateResponse createPayOSLink(String orderId) {
        Order order = findOrderOrThrow(orderId);
        authorizeOrderAccess(order);

        Payment payment = getOrCreatePayment(order, Payment.PaymentMethod.PAYOS);

        if (payment.getStatus() == Payment.PaymentStatus.PAID)
            throw new BusinessException("Don hang nay da duoc thanh toan");

        try {
            PayOS payOS = new PayOS(clientId, apiKey, checksumKey);

            long orderCode = Math.abs((long) payment.getId().hashCode());

            List<ItemData> items = order.getItems().stream()
                    .map(item -> ItemData.builder()
                            .name(item.getProductVariant() != null
                                    ? item.getProductVariant().getSku()
                                    : "San pham")
                            .quantity(item.getQuantity())
                            .price(item.getUnitPrice().intValue())
                            .build())
                    .toList();

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(payment.getAmount().intValue())
                    .description("DH " + orderId.substring(0, 8).toUpperCase())
                    .items(items)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            CheckoutResponseData response = payOS.createPaymentLink(paymentData);

            payment.setTransactionId("PAYOS-" + orderCode);
            paymentRepository.save(payment);

            return PayOSCreateResponse.builder()
                    .paymentId(payment.getId())
                    .orderId(orderId)
                    .paymentUrl(response.getCheckoutUrl())
                    .method("PAYOS")
                    .orderCode(orderCode)
                    .build();

        } catch (Exception e) {
            log.error("PayOS create link error: {}", e.getMessage(), e);
            throw new BusinessException("Khong the tao link thanh toan PayOS: " + e.getMessage());
        }
    }

    // ── PayOS Webhook (server-to-server) ─────────────────────────────

    public Map<String, String> handlePayOSWebhook(Map<String, Object> body) {
        try {
            PayOS payOS = new PayOS(clientId, apiKey, checksumKey);

            Webhook webhook = objectMapper.convertValue(body, Webhook.class);
            WebhookData data = payOS.verifyPaymentWebhookData(webhook);

            if (data == null) {
                log.warn("PayOS webhook: data null sau verify");
                return Map.of("code", "01", "desc", "invalid signature");
            }

            String orderCode = String.valueOf(data.getOrderCode());
            String code      = data.getCode() != null ? data.getCode() : "";

            log.info("PayOS webhook: orderCode={}, code={}", orderCode, code);

            paymentRepository.findAll().stream()
                    .filter(p -> p.getTransactionId() != null &&
                            p.getTransactionId().equals("PAYOS-" + orderCode))
                    .findFirst()
                    .ifPresent(payment -> {
                        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
                            if ("00".equals(code)) {
                                markPaid(payment,
                                        "PAYOS-" + data.getReference(),
                                        body.toString());
                            } else {
                                markFailedAndRestoreStock(payment, body.toString(), code);
                            }
                        }
                    });

            return Map.of("code", "00", "desc", "success");

        } catch (Exception e) {
            log.warn("PayOS webhook error: {}", e.getMessage());
            return Map.of("code", "01", "desc", "fail");
        }
    }

    // ── COD – confirm payment manually (Admin) ───────────────────────

    public PaymentDto confirmCodPayment(String orderId) {
        Order order = findOrderOrThrow(orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        if (payment.getMethod() != Payment.PaymentMethod.COD)
            throw new BusinessException("Chi ap dung cho phuong thuc COD");

        if (payment.getStatus() == Payment.PaymentStatus.PAID)
            throw new BusinessException("Don hang da duoc thanh toan");

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
            throw new BusinessException("Chi co the hoan tien cho don da thanh toan");

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

    private void markFailedAndRestoreStock(Payment payment, String rawResponse, String code) {
        if (payment.getStatus() == Payment.PaymentStatus.FAILED) {
            log.info("Payment {} da FAILED truoc do, bo qua hoan kho", payment.getId());
            return;
        }

        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setRawResponse(rawResponse);
        paymentRepository.save(payment);

        Order order = payment.getOrder();

        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);

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
                    log.info("Hoan kho variant={} qty={} (PayOS code={})",
                            variant.getId(), item.getQuantity(), code);
                }
            });
        }
    }

    private void authorizePaymentAccess(Payment payment) {
        try {
            User user = SecurityUtils.getCurrentUser();
            if (user == null) return;
            if (user.getRole() != null && user.getRole() == User.Role.ROLE_ADMIN) return;
            if (payment.getOrder().getUser() == null ||
                    !payment.getOrder().getUser().getId().equals(user.getId()))
                throw new BusinessException("Ban khong co quyen xem thong tin thanh toan nay");
        } catch (BusinessException be) {
            throw be;
        } catch (Exception ignored) {
        }
    }

    private void authorizeOrderAccess(Order order) {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Ban chua dang nhap");
        if (user.getRole() != null && user.getRole() == User.Role.ROLE_ADMIN) return;
        if (order.getUser() == null || !order.getUser().getId().equals(user.getId()))
            throw new BusinessException("Ban khong co quyen thuc hien thanh toan cho don nay");
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