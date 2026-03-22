package com.example.Server.service;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** Cấu hình VNPAY đọc từ application.properties (prefix: vnpay). */
@Data
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VnpayConfig {
    private String tmnCode;
    private String hashSecret;
    private String payUrl;
    private String returnUrl;
    private String frontendReturnUrl;
    private String ipnUrl;
}
