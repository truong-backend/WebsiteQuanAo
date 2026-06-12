package com.example.fashionstore.module.product;

import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.module.review.Review;
import com.example.fashionstore.module.variant.ProductVariant;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products",
        indexes = {
                @Index(name = "idx_products_slug",        columnList = "slug"),
                @Index(name = "idx_products_category_id", columnList = "category_id"),
                @Index(name = "idx_products_base_price",  columnList = "base_price"),
                @Index(name = "idx_products_is_active",   columnList = "is_active")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Product {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    /** URL-friendly slug — dùng để navigate (SEO) */
    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Giá gốc */
    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    /** Giá sau giảm — null nếu không có khuyến mãi */
    @Column(name = "sale_price", precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "main_image", nullable = false, length = 500)
    private String mainImage;

    @Column(name = "hover_image", length = 500)
    private String hoverImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "rating_avg", nullable = false)
    @Builder.Default
    private Double ratingAvg = 0.0;

    @Column(name = "rating_count", nullable = false)
    @Builder.Default
    private Integer ratingCount = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    /** Trả về giá hiển thị: sale_price nếu có, ngược lại base_price */
    @Transient
    public BigDecimal getEffectivePrice() {
        return salePrice != null ? salePrice : basePrice;
    }

    /** Cập nhật rating_avg và rating_count sau khi add/remove review */
    public void recalculateRating(List<Integer> ratings) {
        this.ratingCount = ratings.size();
        this.ratingAvg = ratings.isEmpty() ? 0.0
                : ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
    }

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