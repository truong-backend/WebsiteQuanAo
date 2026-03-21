package com.example.Server.controller;

import com.example.Server.dto.request.payment.MomoCreatePaymentRequest;
import com.example.Server.dto.request.payment.PaymentCreateRequest;
import com.example.Server.dto.request.payment.PaymentUpdateRequest;
import com.example.Server.dto.request.payment.VnpayCreatePaymentRequest;
import com.example.Server.dto.response.payment.MomoCreatePaymentResponse;
import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.dto.response.payment.VnpayCreatePaymentResponse;
import com.example.Server.service.PaymentService;
import com.example.Server.service.VnpayService;
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
import java.util.Map;
import java.util.Set;

/**
 * REST Controller quản lý Payment và tích hợp cổng thanh toán VNPAY / MoMo.
 * Base path: /payments
 *
 * Mọi business logic và truy cập repository đều được ủy thác cho {@link PaymentService}.
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final VnpayService vnpayService;   // chỉ dùng cho redirect URL builder
    private final String frontendReturnUrl;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "type", "payTime");

    public PaymentController(
            PaymentService paymentService,
            VnpayService vnpayService
    ) {
        this.paymentService = paymentService;
        this.vnpayService = vnpayService;
        this.frontendReturnUrl = "http://localhost:5173/payment/vnpay-return"; // configurable via @Value
    }

    // ─────────────────────────── CRUD ───────────────────────────

    /** GET /payments — danh sách payment có phân trang */
    @GetMapping
    public ResponseEntity<Page<PaymentResponse>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(paymentService.findAll(pageable, search));
    }

    /** POST /payments — tạo payment */
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(request));
    }

    /** PUT /payments/{id} — cập nhật payment */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(
            @PathVariable String id,
            @Valid @RequestBody PaymentUpdateRequest request
    ) {
        return ResponseEntity.ok(paymentService.update(id, request));
    }

    /** DELETE /payments/{id} — xóa payment */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /payments/{id} — chi tiết payment */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    // ─────────────────────────── VNPAY ───────────────────────────

    /** POST /payments/vnpay/create — tạo URL thanh toán VNPAY */
    @PostMapping("/vnpay/create")
    public ResponseEntity<VnpayCreatePaymentResponse> createVnpayPayment(
            @Valid @RequestBody VnpayCreatePaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(paymentService.createVnpayPaymentUrl(request, httpRequest));
    }

    /**
     * GET /payments/vnpay/ipn — VNPAY gọi callback này sau khi thanh toán.
     * Không yêu cầu xác thực JWT (whitelist trong SecurityConfig).
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> handleVnpayIpn(@RequestParam Map<String, String> params) {
        String result = paymentService.handleVnpayIpn(params);
        if ("INVALID_SIGNATURE".equals(result) || "MISSING_ORDER".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * GET /payments/vnpay/return — VNPAY redirect user về đây sau khi thanh toán.
     * Verify chữ ký rồi redirect sang frontend với các tham số thân thiện.
     */
    @GetMapping("/vnpay/return")
    public RedirectView handleVnpayReturn(@RequestParam Map<String, String> params) {
        String bankCode    = params.getOrDefault("vnp_BankCode", "");
        String amount      = params.getOrDefault("vnp_Amount", "");
        String orderId     = params.getOrDefault("vnp_TxnRef", "");
        String transactionNo = params.getOrDefault("vnp_TransactionNo", "");
        String responseCode  = params.getOrDefault("vnp_ResponseCode", "");

        boolean valid = vnpayService.validateSignature(params);
        String status  = (valid && "00".equals(responseCode)) ? "success" : "failed";
        String message = "success".equals(status) ? "Thanh toan thanh cong" : "Thanh toan that bai hoac bi huy";

        try {
            String redirectUrl = frontendReturnUrl
                    + "?bankCode="      + URLEncoder.encode(bankCode, StandardCharsets.UTF_8)
                    + "&amount="        + URLEncoder.encode(amount, StandardCharsets.UTF_8)
                    + "&message="       + URLEncoder.encode(message, StandardCharsets.UTF_8)
                    + "&status="        + URLEncoder.encode(status, StandardCharsets.UTF_8)
                    + "&orderId="       + URLEncoder.encode(orderId, StandardCharsets.UTF_8)
                    + "&transactionNo=" + URLEncoder.encode(transactionNo, StandardCharsets.UTF_8);
            return new RedirectView(redirectUrl);
        } catch (Exception e) {
            return new RedirectView(frontendReturnUrl + "?status=failed&message=Error");
        }
    }

    // ─────────────────────────── MOMO ───────────────────────────

    /** POST /payments/momo/create — tạo URL thanh toán MoMo */
    @PostMapping("/momo/create")
    public ResponseEntity<MomoCreatePaymentResponse> createMomoPayment(
            @Valid @RequestBody MomoCreatePaymentRequest request
    ) {
        return ResponseEntity.ok(paymentService.createMomoPaymentUrl(request));
    }

    /**
     * POST /payments/momo/ipn — MoMo gọi callback này (POST JSON).
     * Không yêu cầu xác thực JWT.
     */
    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, Object>> handleMomoIpn(@RequestBody JsonNode body) {
        String orderId   = body.path("orderId").asText(null);
        int    resultCode = body.path("resultCode").asInt(-1);
        String transId   = body.path("transId").asText(null);

        if (orderId == null || orderId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("resultCode", 97, "message", "Missing orderId"));
        }

        int responseCode = paymentService.handleMomoIpn(orderId, resultCode, transId);
        if (responseCode == 97) {
            return ResponseEntity.ok(Map.of("resultCode", 97, "message", "ORDER_NOT_FOUND"));
        }
        return ResponseEntity.ok(Map.of("resultCode", 0, "message", "OK"));
    }
}
