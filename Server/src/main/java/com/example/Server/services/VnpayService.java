package com.example.Server.services;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Service xử lý build URL / verify chữ ký cho VNPAY.
 * Tích hợp theo đúng source demo chính thức của VNPAY (ajaxServlet.java + Config.java).
 */
@Service
public class VnpayService {

    private final VnpayConfig config;

    public VnpayService(VnpayConfig config) {
        this.config = config;
    }

    /**
     * Tạo URL thanh toán cho đơn hàng.
     * Logic theo ajaxServlet.java của VNPAY demo.
     */
    public String createPaymentUrl(String orderId, long amount, String clientIp) {
        long vnpAmount = amount * 100L;

        // Dùng GMT+7 theo đúng demo VNPAY: TimeZone.getTimeZone("Etc/GMT+7")
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", config.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderId);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", config.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", clientIp);

        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Build hash + query theo đúng logic ajaxServlet.java của VNPAY
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                // Build hash data — encode value (theo đúng demo VNPAY)
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = hmacSHA512(config.getHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        return config.getPayUrl() + "?" + query;
    }

    /**
     * Kiểm tra chữ ký HMAC của callback/IPN từ VNPAY.
     * Logic theo hashAllFields() trong Config.java của VNPAY demo.
     */
    public boolean validateSignature(Map<String, String> params) {
        String receivedSecureHash = params.get("vnp_SecureHash");
        if (receivedSecureHash == null || receivedSecureHash.isBlank()) {
            return false;
        }

        // Loại bỏ vnp_SecureHash và vnp_SecureHashType trước khi tính hash
        Map<String, String> filtered = new HashMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        // Spring tự decode URL params trước khi vào controller
        // nên phải encode lại value khi build hashData để khớp với lúc tạo URL
        List<String> fieldNames = new ArrayList<>(filtered.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = filtered.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                hashData.append(fieldName);
                hashData.append("=");
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
            if (itr.hasNext()) {
                hashData.append("&");
            }
        }

        String calculatedHash = hmacSHA512(config.getHashSecret(), hashData.toString());
        return calculatedHash.equalsIgnoreCase(receivedSecureHash);
    }

    /**
     * hmacSHA512 theo đúng Config.java của VNPAY demo.
     */
    private String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    /**
     * Lấy IP client từ HttpServletRequest.
     * Logic theo Config.getIpAddress() của VNPAY demo.
     */
    public String getClientIp(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAddress = "Invalid IP:" + e.getMessage();
        }
        return ipAddress;
    }
}