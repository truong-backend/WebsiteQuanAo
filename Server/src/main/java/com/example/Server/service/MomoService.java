package com.example.Server.service;

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
 * Service tích hợp cổng thanh toán MoMo (sandbox captureWallet).
 */
@Service
public class MomoService {

    private static final String REQUEST_TYPE = "captureWallet";
    private static final String LANG = "vi";

    private final MomoConfig config;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MomoService(MomoConfig config, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.config = config; this.restTemplate = restTemplate; this.objectMapper = objectMapper;
    }

    /**
     * Tạo URL thanh toán MoMo và trả về payUrl cho client redirect.
     *
     * @param orderId mã đơn hàng
     * @param amount  số tiền VND (1.000 – 50.000.000)
     * @return payUrl từ MoMo
     */
    public String createPaymentUrl(String orderId, long amount) {
        String requestId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan don hang " + orderId;
        String extraData = Base64.getEncoder().encodeToString("".getBytes(StandardCharsets.UTF_8));

        String rawSig = "accessKey=" + config.getAccessKey() + "&amount=" + amount
                + "&extraData=" + extraData + "&ipnUrl=" + config.getIpnUrl()
                + "&orderId=" + orderId + "&orderInfo=" + orderInfo
                + "&partnerCode=" + config.getPartnerCode() + "&redirectUrl=" + config.getRedirectUrl()
                + "&requestId=" + requestId + "&requestType=" + REQUEST_TYPE;
        String signature = hmacSha256(config.getSecretKey(), rawSig);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", config.getPartnerCode()); body.put("accessKey", config.getAccessKey());
        body.put("requestId", requestId); body.put("amount", amount); body.put("orderId", orderId);
        body.put("orderInfo", orderInfo); body.put("redirectUrl", config.getRedirectUrl());
        body.put("ipnUrl", config.getIpnUrl()); body.put("extraData", extraData);
        body.put("requestType", REQUEST_TYPE); body.put("signature", signature);
        body.put("lang", LANG); body.put("autoCapture", true);

        HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = restTemplate.exchange(
                config.getEndpoint(), HttpMethod.POST, new HttpEntity<>(body, headers), String.class);

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null)
            throw new RuntimeException("MoMo API error: invalid response");

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            int resultCode = root.path("resultCode").asInt(-1);
            if (resultCode != 0) throw new RuntimeException("MoMo API error: " + root.path("message").asText());
            String payUrl = root.path("payUrl").asText(null);
            if (payUrl == null) payUrl = root.path("deeplink").asText(null);
            if (payUrl == null) throw new RuntimeException("MoMo API did not return payUrl");
            return payUrl;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse MoMo response", e);
        }
    }

    private String hmacSha256(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) { throw new RuntimeException("HMAC error", e); }
    }
}
