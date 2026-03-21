package com.example.Server.dto.response.payment;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class VnpayCreatePaymentResponse {
    private String payUrl;
}
