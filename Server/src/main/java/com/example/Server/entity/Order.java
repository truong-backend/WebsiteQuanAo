package com.example.Server.entity;

import com.example.Server.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "order_time", nullable = false)
    private LocalDateTime orderTime;

    @Column(name = "phone_number", length = 12, nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String address;

    private String note;

    /** Tổng tiền đơn hàng tại thời điểm đặt (snapshot giá). */
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();
}
