package com.example.fashionstore.controller.payment;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.payment.PaymentDto;
import com.example.fashionstore.dto.payment.VNPayCreateResponse;
import com.example.fashionstore.service.payment.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ── User endpoints ───────────────────────────────────────────────

    /**
     * GET /api/v1/payments/order/{orderId}
     * Lấy thông tin thanh toán của đơn hàng
     */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentDto>> getByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getByOrderId(orderId)));
    }

    /**
     * GET /api/v1/payments/{paymentId}
     * Chi tiết thanh toán
     */
    @GetMapping("/{paymentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentDto>> getById(@PathVariable String paymentId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getById(paymentId)));
    }

    /**
     * POST /api/v1/payments/vnpay/create/{orderId}
     * Tạo URL thanh toán VNPay cho đơn hàng
     */
    @PostMapping("/vnpay/create/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VNPayCreateResponse>> createVNPayUrl(
            @PathVariable String orderId,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        return ResponseEntity.ok(ApiResponse.ok(paymentService.createVNPayUrl(orderId, clientIp)));
    }

    // ── VNPay Callbacks (public — called by VNPay server) ────────────

    /**
     * GET /api/v1/payments/vnpay/return
     * VNPay redirect user về sau khi thanh toán.
     * Redirect về frontend với kết quả.
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        String redirectUrl = paymentService.handleVNPayReturn(params);
        return ResponseEntity.status(302)
                .header("Location", redirectUrl)
                .build();
    }

    /**
     * GET /api/v1/payments/vnpay/ipn
     * VNPay gọi server-to-server để thông báo kết quả.
     * Trả về JSON theo chuẩn VNPay.
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        Map<String, String> response = paymentService.handleVNPayIpn(params);
        return ResponseEntity.ok(response);
    }

    // ── Admin endpoints ──────────────────────────────────────────────

    /**
     * POST /api/v1/payments/cod/confirm/{orderId}
     * Admin xác nhận thanh toán COD khi giao hàng thành công
     */
    @PostMapping("/cod/confirm/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentDto>> confirmCod(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Xác nhận thanh toán COD thành công",
                paymentService.confirmCodPayment(orderId)
        ));
    }

    /**
     * POST /api/v1/payments/refund/{orderId}
     * Admin đánh dấu hoàn tiền
     */
    @PostMapping("/refund/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentDto>> refund(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã đánh dấu hoàn tiền",
                paymentService.markRefunded(orderId)
        ));
    }

    // ── Helper ───────────────────────────────────────────────────────

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs from proxy chain
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }
}