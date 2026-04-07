package com.example.fashionstore.module.size;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sizes",
        indexes = {
                @Index(name = "idx_sizes_code", columnList = "code")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Size {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã kích cỡ, ví dụ: S, M, L, XL, XXL, 28, 30 */
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    /** Tên hiển thị, ví dụ: Small, Medium */
    @Column(nullable = false, length = 100)
    private String name;

    /** Thứ tự hiển thị (sắp xếp S→M→L→XL) */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}