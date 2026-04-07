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

    /** Stock Keeping Unit — định danh duy nhất cho mỗi variant */
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** FK sang bảng colors */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id", nullable = false)
    private Color color;

    /** FK sang bảng sizes */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id", nullable = false)
    private Size size;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Backward-compat helper — trả về mô tả gọn: "Đỏ / M" */
    @Transient
    public String getVariantInfo() {
        String colorName = color != null ? color.getName() : "?";
        String sizeCode  = size  != null ? size.getCode()  : "?";
        return colorName + " / " + sizeCode;
    }

    // ── Convenience getters dùng trong snapshot (OrderItem) ──────────

    @Transient
    public String getColorCode() { return color != null ? color.getCode() : null; }

    @Transient
    public String getColorName() { return color != null ? color.getName() : null; }

    @Transient
    public String getSizeCode()  { return size  != null ? size.getCode()  : null; }
}