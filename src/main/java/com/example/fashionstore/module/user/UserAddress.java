package com.example.fashionstore.module.user;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Địa chỉ giao hàng đã lưu của user.
 * Mỗi user có thể lưu nhiều địa chỉ, 1 địa chỉ là mặc định.
 */
@Entity
@Table(name = "user_addresses",
        indexes = {
                @Index(name = "idx_addr_user_id",      columnList = "user_id"),
                @Index(name = "idx_addr_is_default",   columnList = "is_default")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Tên người nhận tại địa chỉ này */
    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    /** Số điện thoại người nhận */
    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    /** Địa chỉ đầy đủ */
    @Column(nullable = false, length = 300)
    private String address;

    /** Địa chỉ mặc định */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean defaultAddress = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}