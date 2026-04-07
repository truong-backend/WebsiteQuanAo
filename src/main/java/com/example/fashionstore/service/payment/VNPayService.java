package com.example.fashionstore.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * VNPay utility – tạo payment URL và verify checksum.
 * Dựa trên tài liệu VNPay 2.1.0
 */
@Component
@Slf4j
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.payUrl}")
    private String payUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    @Value("${vnpay.ipnUrl}")
    private String ipnUrl;

    private static final String VERSION      = "2.1.0";
    private static final String COMMAND      = "pay";
    private static final String CURR_CODE    = "VND";
    private static final String LOCALE       = "vn";
    private static final String ORDER_TYPE   = "other";

    /**
     * Tạo URL thanh toán VNPay.
     *
     * @param orderId    Mã đơn hàng nội bộ (sẽ được encode)
     * @param amount     Số tiền (VND)
     * @param orderInfo  Mô tả đơn hàng
     * @param clientIp   IP của client
     */
    public String createPaymentUrl(String orderId, BigDecimal amount, String orderInfo, String clientIp) {
        String vnpTxnRef   = orderId.replace("-", "").substring(0, Math.min(orderId.replace("-","").length(), 20));
        String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String vnpExpireDate = getExpireDate();

        // VNPay yêu cầu amount * 100 (đơn vị: đồng → xu)
        long vnpAmount = amount.longValue() * 100;

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version",     VERSION);
        params.put("vnp_Command",     COMMAND);
        params.put("vnp_TmnCode",     tmnCode);
        params.put("vnp_Amount",      String.valueOf(vnpAmount));
        params.put("vnp_CurrCode",    CURR_CODE);
        params.put("vnp_TxnRef",      vnpTxnRef);
        params.put("vnp_OrderInfo",   orderInfo);
        params.put("vnp_OrderType",   ORDER_TYPE);
        params.put("vnp_Locale",      LOCALE);
        params.put("vnp_ReturnUrl",   returnUrl);
        params.put("vnp_IpAddr",      clientIp);
        params.put("vnp_CreateDate",  vnpCreateDate);
        params.put("vnp_ExpireDate",  vnpExpireDate);

        // Build query string (sorted by key – required by VNPay)
        StringBuilder hashData  = new StringBuilder();
        StringBuilder queryStr  = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) { hashData.append("&"); queryStr.append("&"); }
            hashData.append(entry.getKey()).append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            queryStr.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                    .append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            first = false;
        }

        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        queryStr.append("&vnp_SecureHash=").append(secureHash);

        return payUrl + "?" + queryStr;
    }

    /**
     * Verify checksum từ VNPay callback (Return URL hoặc IPN).
     * @param params  Query params từ VNPay
     * @return true nếu checksum hợp lệ
     */
    public boolean verifyChecksum(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        // Loại bỏ vnp_SecureHash và vnp_SecureHashType trước khi tính lại
        Map<String, String> filtered = new TreeMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> e : filtered.entrySet()) {
            if (!first) hashData.append("&");
            hashData.append(e.getKey()).append("=")
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
            first = false;
        }

        String computed = hmacSHA512(hashSecret, hashData.toString());
        return computed.equalsIgnoreCase(receivedHash);
    }

    /**
     * Lấy mã kết quả giao dịch từ params VNPay.
     * "00" = thành công
     */
    public String getResponseCode(Map<String, String> params) {
        return params.getOrDefault("vnp_ResponseCode", "");
    }

    /**
     * Lấy transactionId (vnp_TransactionNo) từ params.
     */
    public String getTransactionId(Map<String, String> params) {
        return params.getOrDefault("vnp_TransactionNo", "");
    }

    /**
     * Lấy orderId từ vnp_TxnRef trong params.
     */
    public String getTxnRef(Map<String, String> params) {
        return params.getOrDefault("vnp_TxnRef", "");
    }

    // ── Private helpers ──────────────────────────────────────────────

    private String getExpireDate() {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        cal.add(Calendar.MINUTE, 15);
        return new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            log.error("HMAC SHA512 error: {}", e.getMessage());
            throw new RuntimeException("Failed to compute HMAC SHA512", e);
        }
    }
}