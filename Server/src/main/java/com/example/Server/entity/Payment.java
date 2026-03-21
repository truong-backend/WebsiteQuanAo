package com.example.Server.entity;

import com.example.Server.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @Column(length = 36)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType type;

    /** Thời điểm thanh toán thực tế — null cho đến khi xác nhận (BANKING/MOMO/VNPAY). */
    @Column(name = "pay_time")
    private Instant payTime;

    @OneToOne(mappedBy = "payment")
    private Order order;
}
