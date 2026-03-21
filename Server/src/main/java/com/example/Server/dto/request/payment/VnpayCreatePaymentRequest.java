package com.example.Server.dto.request.payment;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class VnpayCreatePaymentRequest {
    @NotBlank(message = "orderId is required")
    private String orderId;

    @Min(value = 1, message = "amount must be > 0")
    private long amount;
}
