package com.example.fashionstore.controller.payment;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.payment.PaymentDto;
import com.example.fashionstore.dto.payment.PayOSCreateResponse;
import com.example.fashionstore.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
     * POST /api/v1/payments/payos/create/{orderId}
     * Tạo link thanh toán PayOS cho đơn hàng
     */
    @PostMapping("/payos/create/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PayOSCreateResponse>> createPayOSLink(
            @PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.createPayOSLink(orderId)));
    }

    /**
     * POST /api/v1/payments/payos/webhook
     * PayOS gọi server-to-server để thông báo kết quả thanh toán.
     */
    @PostMapping("/payos/webhook")
    public ResponseEntity<Map<String, String>> payosWebhook(
            @RequestBody Map<String, Object> body) {
        Map<String, String> result = paymentService.handlePayOSWebhook(body);
        return ResponseEntity.ok(result);
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
}