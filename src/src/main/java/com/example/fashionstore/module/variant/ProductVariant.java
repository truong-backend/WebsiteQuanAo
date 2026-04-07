package com.example.fashionstore.module.variant;

import com.example.fashionstore.module.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_variant", columnNames = {"product_id", "color_code", "size_code"}
        ),
        indexes = {
                @Index(name = "idx_variants_product_id", columnList = "product_id"),
                @Index(name = "idx_variants_sku",        columnList = "sku")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ProductVariant {

    @Id
    @Column(length = 36)
    private String id;

    /** Stock Keeping Unit — định danh duy nhất cho mỗi variant */
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "color_code", nullable = false, length = 20)
    private String colorCode;

    @Column(name = "color_name", nullable = false, length = 50)
    private String colorName;   // denormalize để tránh JOIN khi hiển thị

    @Column(name = "size_code", nullable = false, length = 10)
    private String sizeCode;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Trả về mô tả gọn: "Đỏ / M" */
    @Transient
    public String getVariantInfo() {
        return colorName + " / " + sizeCode;
    }
}