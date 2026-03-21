package com.example.Server.dto.response.payment;

import com.example.Server.enums.PaymentType;
import lombok.*;
import java.time.Instant;

@Data @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private String id;
    private PaymentType type;
    private Instant payTime;
}
