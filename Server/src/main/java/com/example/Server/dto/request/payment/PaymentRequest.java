package com.example.Server.dto.request.payment;

import com.example.Server.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private String id;
    private PaymentType type;
    private Instant payTime;
}
