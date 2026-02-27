package com.example.Server.controller;

import com.example.Server.dto.request.payment.PaymentCreateRequest;
import com.example.Server.dto.request.payment.PaymentUpdateRequest;
import com.example.Server.dto.request.payment.MomoCreatePaymentRequest;
import com.example.Server.dto.request.payment.VnpayCreatePaymentRequest;
import com.example.Server.dto.response.payment.MomoCreatePaymentResponse;
import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.dto.response.payment.VnpayCreatePaymentResponse;
import com.example.Server.entity.Order;
import com.example.Server.entity.Payment;
import com.example.Server.enums.OrderStatus;
import com.example.Server.enums.PaymentType;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.repository.OrderRepository;
import com.example.Server.repository.PaymentRepository;
import com.example.Server.services.MomoService;
import com.example.Server.services.PaymentService;
import com.example.Server.services.VnpayConfig;
import com.example.Server.services.VnpayService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

/**
 * REST Controller for Payment management + tích hợp VNPAY
 * Base path: /payments
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final VnpayService vnpayService;
    private final MomoService momoService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final VnpayConfig vnpayConfig;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "type",
            "payTime"
    );

    public PaymentController(
            PaymentService paymentService,
            VnpayService vnpayService,
            MomoService momoService,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            VnpayConfig vnpayConfig
    ) {
        this.paymentService = paymentService;
        this.vnpayService = vnpayService;
        this.momoService = momoService;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.vnpayConfig = vnpayConfig;
    }

    /**
     * Get paginated payments with filter and search
     * GET /payments
     */
    @GetMapping
    public ResponseEntity<Page<PaymentResponse>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                paymentService.findAll(pageable, search)
        );
    }

    /**
     * Create payment
     * POST /payments
     */
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paymentService.create(request));
    }

    /**
     * Update payment
     * PUT /payments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(
            @PathVariable String id,
            @Valid @RequestBody PaymentUpdateRequest request
    ) {
        return ResponseEntity.ok(
                paymentService.update(id, request)
        );
    }

    /**
     * Delete payment
     * DELETE /payments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

    /**
     * Get payment by id
     * GET /payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                paymentService.getById(id)
        );
    }

    /**
     * Tạo URL thanh toán VNPAY cho một đơn hàng.
     * POST /payments/vnpay/create
     */
    @PostMapping("/vnpay/create")
    public ResponseEntity<VnpayCreatePaymentResponse> createVnpayPayment(
            @Valid @RequestBody VnpayCreatePaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        String clientIp = vnpayService.getClientIp(httpRequest);
        String payUrl = vnpayService.createPaymentUrl(order.getId(), request.getAmount(), clientIp);

        return ResponseEntity.ok(new VnpayCreatePaymentResponse(payUrl));
    }

    /**
     * IPN callback từ VNPAY.
     * VNPAY sẽ gửi nhiều tham số vnp_*. Ta verify chữ ký và cập nhật trạng thái đơn hàng / payment.
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> handleVnpayIpn(@RequestParam Map<String, String> params) {
        boolean valid = vnpayService.validateSignature(params);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("INVALID_SIGNATURE");
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef"); // orderId

        if (txnRef == null || txnRef.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("MISSING_ORDER");
        }

        Order order = orderRepository.findById(txnRef)
                .orElse(null);

        if (order == null) {
            return ResponseEntity.status(HttpStatus.OK).body("ORDER_NOT_FOUND");
        }

        // Nếu thanh toán thành công (00) thì cập nhật Payment + Order
        if ("00".equals(responseCode)) {
            // Tạo Payment mới nếu chưa có
            Payment payment = order.getPayment();
            if (payment == null) {
                payment = new Payment();
                payment.setId(params.getOrDefault("vnp_TransactionNo", "VNPAY-" + txnRef));
                payment.setType(PaymentType.VNPAY);
                payment.setPayTime(Instant.now());
                payment.setOrder(order);
                paymentRepository.save(payment);
                order.setPayment(payment);
            } else {
                payment.setType(PaymentType.VNPAY);
                payment.setPayTime(Instant.now());
                paymentRepository.save(payment);
            }

            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);

            return ResponseEntity.ok("OK");
        }

        // Mã khác 00: thanh toán thất bại hoặc bị hủy -> có thể set CANCELLED
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return ResponseEntity.ok("CANCELLED");
    }

    /**
     * Tạo URL thanh toán MoMo cho một đơn hàng.
     * POST /payments/momo/create
     */
    @PostMapping("/momo/create")
    public ResponseEntity<MomoCreatePaymentResponse> createMomoPayment(
            @Valid @RequestBody MomoCreatePaymentRequest request
    ) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        String payUrl = momoService.createPaymentUrl(order.getId(), request.getAmount());
        return ResponseEntity.ok(new MomoCreatePaymentResponse(payUrl));
    }

    /**
     * IPN callback từ MoMo (POST JSON body).
     */
    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, Object>> handleMomoIpn(@RequestBody JsonNode body) {
        String orderId = body.path("orderId").asText(null);
        if (orderId == null || orderId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("resultCode", 97, "message", "Missing orderId"));
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.ok(Map.of("resultCode", 97, "message", "ORDER_NOT_FOUND"));
        }

        int resultCode = body.path("resultCode").asInt(-1);
        if (resultCode == 0) {
            Payment payment = order.getPayment();
            if (payment == null) {
                payment = new Payment();
                payment.setId(body.path("transId").asText("MOMO-" + orderId));
                payment.setType(PaymentType.MOMO);
                payment.setPayTime(Instant.now());
                payment.setOrder(order);
                paymentRepository.save(payment);
                order.setPayment(payment);
            } else {
                payment.setType(PaymentType.MOMO);
                payment.setPayTime(Instant.now());
                paymentRepository.save(payment);
            }
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of("resultCode", 0, "message", "OK"));
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("resultCode", 0, "message", "CANCELLED"));
    }

    /**
     * Return URL - VNPAY redirect user về đây sau khi thanh toán.
     * Backend verify chữ ký, map sang format thân thiện rồi redirect sang frontend.
     * Format params: bankCode, amount, message, status, orderId, transactionNo
     */
    @GetMapping("/vnpay/return")
    public RedirectView handleVnpayReturn(@RequestParam Map<String, String> params) {
        String frontendUrl = vnpayConfig.getFrontendReturnUrl();
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5173/payment/vnpay-return";
        }

        String bankCode = params.getOrDefault("vnp_BankCode", "");
        String amount = params.getOrDefault("vnp_Amount", "");
        String orderId = params.getOrDefault("vnp_TxnRef", "");
        String transactionNo = params.getOrDefault("vnp_TransactionNo", "");
        String responseCode = params.getOrDefault("vnp_ResponseCode", "");

        boolean valid = vnpayService.validateSignature(params);
        String status = "failed";
        String message = "Thanh toan that bai hoac bi huy";
        if (valid && "00".equals(responseCode)) {
            status = "success";
            message = "Thanh toan thanh cong";
        }

        try {
            StringBuilder sb = new StringBuilder(frontendUrl);
            sb.append("?bankCode=").append(URLEncoder.encode(bankCode, StandardCharsets.UTF_8));
            sb.append("&amount=").append(URLEncoder.encode(amount, StandardCharsets.UTF_8));
            sb.append("&message=").append(URLEncoder.encode(message, StandardCharsets.UTF_8));
            sb.append("&status=").append(URLEncoder.encode(status, StandardCharsets.UTF_8));
            sb.append("&orderId=").append(URLEncoder.encode(orderId, StandardCharsets.UTF_8));
            sb.append("&transactionNo=").append(URLEncoder.encode(transactionNo, StandardCharsets.UTF_8));
            return new RedirectView(sb.toString());
        } catch (Exception e) {
            return new RedirectView(frontendUrl + "?status=failed&message=Error");
        }
    }
}