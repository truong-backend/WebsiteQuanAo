package com.example.Server.dto.request.payment;

import com.example.Server.enums.PaymentType;
import lombok.*;
import java.time.Instant;

@Data @NoArgsConstructor @AllArgsConstructor
public class PaymentCreateRequest {
    private String id;
    private PaymentType type;
    private Instant payTime;
}
