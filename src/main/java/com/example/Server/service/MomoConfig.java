package com.example.Server.service;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** Cấu hình MoMo đọc từ application.properties (prefix: momo). */
@Data
@Component
@ConfigurationProperties(prefix = "momo")
public class MomoConfig {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String endpoint;
    private String redirectUrl;
    private String ipnUrl;
}
