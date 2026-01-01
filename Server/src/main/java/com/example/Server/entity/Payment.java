package com.example.Server.entity;


import com.example.Server.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @Column(name = "id", length = 36)
    private String id; // Mã thanh toán

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PaymentType type; // Loại thanh toán

    @Column(name = "pay_time")
    private Instant payTime; // Giờ thanh toán (có thể null)

    /* ===== KHÓA NGOẠI ORDER ===== */
    @OneToOne(mappedBy = "payment")
    private Order order;


}
