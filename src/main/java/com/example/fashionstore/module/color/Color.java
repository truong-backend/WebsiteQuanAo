package com.example.fashionstore.module.color;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "colors",
        indexes = {
                @Index(name = "idx_colors_code", columnList = "code")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Color {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã màu hex, ví dụ: #FF0000 */
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    /** Tên màu tiếng Việt, ví dụ: Đỏ tươi */
    @Column(nullable = false, length = 100)
    private String name;

    /** Tên màu tiếng Anh, ví dụ: Red */
    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // ================= SOFT DELETE =================

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ================= METHODS =================

    public void softDelete() {
        this.deleted   = true;
        this.deletedAt = LocalDateTime.now();
        this.active    = false;
    }

    public void restore() {
        this.deleted   = false;
        this.deletedAt = null;
        this.active    = true;
    }
}