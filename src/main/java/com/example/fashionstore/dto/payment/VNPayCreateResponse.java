package com.example.fashionstore.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VNPayCreateResponse {
    private String paymentId;
    private String orderId;
    private String paymentUrl;   // URL redirect sang VNPay
    private String method;
}