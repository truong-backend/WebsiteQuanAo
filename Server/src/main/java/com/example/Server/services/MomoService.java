package com.example.Server.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Service gọi API MoMo sandbox để tạo thanh toán (captureWallet).
 */
@Service
public class MomoService {

    private static final String REQUEST_TYPE = "captureWallet";
    private static final String LANG = "vi";

    private final MomoConfig config;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MomoService(MomoConfig config, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.config = config;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Tạo thanh toán MoMo: gọi API create, trả về payUrl cho client redirect.
     *
     * @param orderId mã đơn hàng
     * @param amount  số tiền VND (1.000 - 50.000.000)
     * @return payUrl từ MoMo
     */
    public String createPaymentUrl(String orderId, long amount) {
        String requestId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan don hang " + orderId;
        String extraData = Base64.getEncoder().encodeToString("".getBytes(StandardCharsets.UTF_8));

        String rawSignature = buildRawSignature(
                config.getAccessKey(),
                amount,
                extraData,
                config.getIpnUrl(),
                orderId,
                orderInfo,
                config.getPartnerCode(),
                config.getRedirectUrl(),
                requestId,
                REQUEST_TYPE
        );
        String signature = hmacSha256(config.getSecretKey(), rawSignature);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", config.getPartnerCode());
        body.put("accessKey", config.getAccessKey());
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", config.getRedirectUrl());
        body.put("ipnUrl", config.getIpnUrl());
        body.put("extraData", extraData);
        body.put("requestType", REQUEST_TYPE);
        body.put("signature", signature);
        body.put("lang", LANG);
        body.put("autoCapture", true);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                config.getEndpoint(),
                HttpMethod.POST,
                entity,
                String.class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("MoMo API error: invalid response");
        }

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            int resultCode = root.path("resultCode").asInt(-1);
            String message = root.path("message").asText("");
            if (resultCode != 0) {
                throw new RuntimeException("MoMo API error: " + message + " (resultCode=" + resultCode + ")");
            }
            String payUrl = root.path("payUrl").asText(null);
            if (payUrl == null || payUrl.isBlank()) {
                payUrl = root.path("deeplink").asText(null);
            }
            if (payUrl == null || payUrl.isBlank()) {
                throw new RuntimeException("MoMo API did not return payUrl or deeplink");
            }
            return payUrl;
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Failed to parse MoMo response", e);
        }
    }

    /**
     * Chuỗi ký theo thứ tự: accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
     */
    private String buildRawSignature(String accessKey, long amount, String extraData,
                                      String ipnUrl, String orderId, String orderInfo,
                                      String partnerCode, String redirectUrl, String requestId, String requestType) {
        return "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;
    }

    private String hmacSha256(String secretKey, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b & 0xff));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating MoMo HMAC", e);
        }
    }

    /**
     * Xác thực chữ ký IPN từ MoMo (callback POST body JSON).
     * MoMo gửi resultCode, orderId, signature, ... Cần build lại rawSignature và so sánh.
     */
    public boolean validateIpnSignature(JsonNode body) {
        String receivedSignature = body.path("signature").asText(null);
        if (receivedSignature == null || receivedSignature.isBlank()) {
            return false;
        }
        long amount = body.path("amount").asLong(0);
        String orderId = body.path("orderId").asText("");
        String orderInfo = body.path("orderInfo").asText("");
        String orderType = body.path("orderType").asText("");
        String requestId = body.path("requestId").asText("");
        int resultCode = body.path("resultCode").asInt(-1);
        String message = body.path("message").asText("");
        String extraData = body.path("extraData").asText("");
        long responseTime = body.path("responseTime").asLong(0);

        String rawSignature = "accessKey=" + config.getAccessKey()
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&message=" + message
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&orderType=" + orderType
                + "&requestId=" + requestId
                + "&requestType=" + REQUEST_TYPE
                + "&responseTime=" + responseTime
                + "&resultCode=" + resultCode
                + "&transId=" + body.path("transId").asText("");
        String calculated = hmacSha256(config.getSecretKey(), rawSignature);
        return calculated.equalsIgnoreCase(receivedSignature);
    }
}
