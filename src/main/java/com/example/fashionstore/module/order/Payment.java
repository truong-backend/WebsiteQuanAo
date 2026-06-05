package com.example.fashionstore.module.order;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments",
        indexes = {
                @Index(name = "idx_payments_order_id",       columnList = "order_id"),
                @Index(name = "idx_payments_transaction_id", columnList = "transaction_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "pay_time")
    private LocalDateTime payTime;

    /** Response gốc từ VNPay/Momo để debug */
    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentMethod { COD, BANKING, MOMO, PAYOS }
    public enum PaymentStatus { PENDING, PAID, FAILED, REFUNDED }
}