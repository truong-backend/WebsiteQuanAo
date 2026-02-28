package com.example.Server.services;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Cấu hình MoMo sandbox (đọc từ application.properties với prefix momo.*)
 */
@Data
@Component
@ConfigurationProperties(prefix = "momo")
public class MomoConfig {

    private String partnerCode;
    private String accessKey;
    private String secretKey;
    /**
     * URL API tạo giao dịch (sandbox: https://test-payment.momo.vn/v2/gateway/api/create)
     */
    private String endpoint;
    /**
     * URL frontend MoMo redirect sau khi thanh toán (ví dụ http://localhost:3000/payment/momo-return)
     */
    private String redirectUrl;
    /**
     * URL backend nhận IPN từ MoMo (ví dụ http://localhost:8080/payments/momo/ipn)
     */
    private String ipnUrl;
}
