package com.example.fashionstore.module.user;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email"),
                @Index(name = "idx_users_role",  columnList = "role")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails, org.springframework.security.oauth2.core.user.OAuth2User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 15)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    /** true sau khi user xác thực email bằng OTP */
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    /** Soft delete: null = active, non-null = thời điểm bị xóa */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "google_id", length = 100, unique = true)
    private String googleId;

    /** true nếu tài khoản đăng ký qua Google (không có password) */
    @Column(name = "oauth2_user", nullable = false)
    @Builder.Default
    private boolean oauth2User = false;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    // ── Helpers ──────────────────────────────────────────────────────

    public boolean isDeleted()    { return deletedAt != null; }
    public boolean isEnabledRaw() { return enabled; }

    // ── UserDetails ─────────────────────────────────────────────────
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override public String  getUsername()             { return email; }
    /** Tài khoản bị xóa mềm sẽ không thể đăng nhập */
    @Override public boolean isEnabled() {
        // OAuth2 users không cần verify email
        return enabled && (emailVerified || oauth2User) && deletedAt == null;
    }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    public enum Role { ROLE_USER, ROLE_ADMIN }

    // ── OAuth2User ────────────────────────────────────────────────────
    @Override
    public Map<String, Object> getAttributes() {
        return Map.of(
                "sub",     googleId != null ? googleId : "",
                "email",   email,
                "name",    name,
                "picture", avatarUrl != null ? avatarUrl : ""
        );
    }

    // OAuth2User requires a "name" attribute key — we use email as principal name
    @Override
    public String getName() { return email; }
}