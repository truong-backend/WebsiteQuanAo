package com.example.Server.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về URL thanh toán MoMo cho client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomoCreatePaymentResponse {
    private String payUrl;
}
