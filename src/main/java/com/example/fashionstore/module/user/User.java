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

/**
 * User entity — Index + Chuẩn hóa DB
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INDEX:                                                          ║
 * ║  idx_users_email  → tăng tốc login (WHERE email = ?)            ║
 * ║  idx_users_role   → tăng tốc query admin/user filter            ║
 * ║  Khi nào dùng Index: cột thường xuyên WHERE/JOIN/ORDER BY       ║
 * ║  Đánh đổi: INSERT/UPDATE chậm hơn vì phải cập nhật B-Tree index ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  CHUẨN HÓA (Normal Form):                                        ║
 * ║                                                                  ║
 * ║  NF1 (1NF): Mỗi ô có 1 giá trị nguyên tử, không lặp group       ║
 * ║  → User KHÔNG lưu danh sách địa chỉ trong 1 cột (JSON array)    ║
 * ║  → Tách ra bảng UserAddress riêng (1-N)                         ║
 * ║                                                                  ║
 * ║  NF2 (2NF): NF1 + mọi non-key phụ thuộc hoàn toàn vào PK       ║
 * ║  → Trong OrderItem: productName, unitPrice lưu riêng (snapshot) ║
 * ║    vì chúng là thông tin tại thời điểm mua, không phụ thuộc     ║
 * ║    vào Product.name hay Product.price hiện tại                  ║
 * ║                                                                  ║
 * ║  NF3 (3NF): NF2 + không có phụ thuộc bắc cầu (transitive dep)  ║
 * ║  → User không lưu categoryName (phụ thuộc vào categoryId)       ║
 * ║  → Mỗi entity chỉ chứa data thuộc về chính nó                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  SINGLETON: @Entity bean quản lý bởi JPA, mỗi record là 1 obj  ║
 * ║  trong Persistence Context (first-level cache)                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
@Entity
@Table(name = "users",
        indexes = {
                // Index B-Tree trên email: tìm kiếm O(log n) thay vì O(n)
                @Index(name = "idx_users_email", columnList = "email"),
                // Index trên role: filter admin nhanh
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

    /**
     * unique = true → DB tạo UNIQUE INDEX tự động
     * Đảm bảo NF3: email là candidate key, không có transitive dependency
     */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * BCrypt hash — lưu hash, không lưu plain text
     * HEAP: password string cấp phát dynamic, tồn tại trong session
     */
    @Column(nullable = false)
    private String password;

    @Column(length = 15)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /**
     * EnumType.STRING: lưu "ROLE_USER"/"ROLE_ADMIN" thay vì ordinal số
     * → an toàn khi thêm enum value mới (không bị lệch index)
     */
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

    /**
     * Soft delete: null = active, non-null = thời điểm bị xóa
     * → Không xóa thật khỏi DB, giữ lại để audit trail (NF1: 1 cột = 1 ý nghĩa)
     */
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

    // ── UserDetails — Interface (SOLID-I: User chỉ implement những gì cần) ──

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override public String  getUsername()             { return email; }

    /**
     * isEnabled() — Logic phức tạp: kết hợp 3 điều kiện
     * Luồng (Thread): mỗi HTTP request là 1 thread riêng,
     * Spring Security gọi isEnabled() trong Filter thread
     */
    @Override public boolean isEnabled() {
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

    @Override
    public String getName() { return email; }
}