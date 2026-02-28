package com.example.Server.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về URL thanh toán VNPAY cho client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VnpayCreatePaymentResponse {
    private String payUrl;
}

