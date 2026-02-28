package com.example.Server.services;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Cấu hình VNPAY (đọc từ application.properties với prefix vnpay.*)
 */
@Data
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VnpayConfig {

    /**
     * Mã website (Terminal code) do VNPAY cấp.
     */
    private String tmnCode;

    /**
     * Chuỗi bí mật dùng để ký HMAC.
     */
    private String hashSecret;

    /**
     * URL thanh toán sandbox của VNPAY.
     */
    private String payUrl;

    /**
     * URL frontend VNPAY redirect sau khi thanh toán (ví dụ http://localhost:3000/payment/vnpay-return).
     */
    private String returnUrl;


    private String frontendReturnUrl;
    /**
     * URL backend nhận IPN từ VNPAY (ví dụ http://localhost:8080/payments/vnpay/ipn).
     */
    private String ipnUrl;
}

