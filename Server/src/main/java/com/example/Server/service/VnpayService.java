package com.example.Server.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Service tích hợp cổng thanh toán VNPAY.
 * Logic theo source demo chính thức của VNPAY.
 */
@Service
public class VnpayService {

    private final VnpayConfig config;

    public VnpayService(VnpayConfig config) { this.config = config; }

    /**
     * Tạo URL thanh toán VNPAY cho đơn hàng.
     *
     * @param orderId  mã đơn hàng (vnp_TxnRef)
     * @param amount   số tiền VND
     * @param clientIp IP của client
     * @return URL redirect sang trang thanh toán VNPAY
     */
    public String createPaymentUrl(String orderId, long amount, String clientIp) {
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");     params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100L));
        params.put("vnp_CurrCode", "VND");       params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", "Thanh toan don hang:" + orderId);
        params.put("vnp_OrderType", "other");    params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", fmt.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", fmt.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder(), query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String name = itr.next(), value = params.get(name);
            if (value != null && !value.isEmpty()) {
                hashData.append(name).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(name, StandardCharsets.US_ASCII)).append('=')
                     .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                if (itr.hasNext()) { query.append('&'); hashData.append('&'); }
            }
        }
        query.append("&vnp_SecureHash=").append(hmacSha512(config.getHashSecret(), hashData.toString()));
        return config.getPayUrl() + "?" + query;
    }

    /** Xác thực chữ ký HMAC từ callback/IPN của VNPAY. */
    public boolean validateSignature(Map<String, String> params) {
        String received = params.get("vnp_SecureHash");
        if (received == null || received.isBlank()) return false;
        Map<String, String> filtered = new HashMap<>(params);
        filtered.remove("vnp_SecureHash"); filtered.remove("vnp_SecureHashType");
        List<String> names = new ArrayList<>(filtered.keySet());
        Collections.sort(names);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = names.iterator();
        while (itr.hasNext()) {
            String name = itr.next(), value = filtered.get(name);
            if (value != null && !value.isEmpty())
                hashData.append(name).append("=").append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
            if (itr.hasNext()) hashData.append("&");
        }
        return hmacSha512(config.getHashSecret(), hashData.toString()).equalsIgnoreCase(received);
    }

    /** Lấy IP client, hỗ trợ proxy. */
    public String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-FORWARDED-FOR");
        return ip != null ? ip : request.getRemoteAddr();
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA512"));
            byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : result) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) { return ""; }
    }
}
