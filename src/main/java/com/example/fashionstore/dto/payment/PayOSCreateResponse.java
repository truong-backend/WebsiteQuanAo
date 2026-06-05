package com.example.fashionstore.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayOSCreateResponse {
    private String  paymentId;
    private String  orderId;
    private String  paymentUrl;   // URL redirect sang PayOS
    private String  method;
    private Long    orderCode;    // Mã đơn hàng PayOS (số nguyên)
}