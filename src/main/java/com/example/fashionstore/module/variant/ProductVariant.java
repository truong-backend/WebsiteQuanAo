// Chỗ cần paste: thay toàn bộ file ProductVariant.java
package com.example.fashionstore.module.variant;

import com.example.fashionstore.module.color.Color;
import com.example.fashionstore.module.product.Product;
import com.example.fashionstore.module.size.Size;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_variant", columnNames = {"product_id", "color_id", "size_id"}
        ),
        indexes = {
                @Index(name = "idx_variants_product_id", columnList = "product_id"),
                @Index(name = "idx_variants_sku",        columnList = "sku"),
                @Index(name = "idx_variants_color_id",   columnList = "color_id"),
                @Index(name = "idx_variants_size_id",    columnList = "size_id")
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

    /** Optimistic Lock — tránh race condition khi import/adjust kho đồng thời */
    @Version
    private Long version;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id", nullable = false)
    private Color color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id", nullable = false)
    private Size size;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Transient
    public String getVariantInfo() {
        String colorName = color != null ? color.getName() : "?";
        String sizeCode  = size  != null ? size.getCode()  : "?";
        return colorName + " / " + sizeCode;
    }

    @Transient
    public String getColorCode() { return color != null ? color.getCode() : null; }

    @Transient
    public String getColorName() { return color != null ? color.getName() : null; }

    @Transient
    public String getSizeCode()  { return size  != null ? size.getCode()  : null; }
}