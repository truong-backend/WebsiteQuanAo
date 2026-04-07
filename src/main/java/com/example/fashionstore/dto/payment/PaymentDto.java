package com.example.fashionstore.dto.payment;

import com.example.fashionstore.module.order.Payment;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentDto {
    private String         id;
    private String         orderId;
    private Payment.PaymentMethod method;
    private Payment.PaymentStatus status;
    private BigDecimal     amount;
    private String         transactionId;
    private LocalDateTime  payTime;
    private LocalDateTime  createdAt;
}