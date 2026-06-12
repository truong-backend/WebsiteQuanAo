package com.example.fashionstore.module.auth;

import com.example.fashionstore.module.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens",
        indexes = {
                @Index(name = "idx_rt_token",   columnList = "token",   unique = true),
                @Index(name = "idx_rt_user_id", columnList = "user_id"),
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID ngẫu nhiên, gửi về client */
    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Thời điểm hết hạn */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /** Đã bị revoke chưa (logout, đổi mật khẩu, v.v.) */
    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }
}