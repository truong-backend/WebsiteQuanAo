package com.example.fashionstore.module.order;

import com.example.fashionstore.module.variant.ProductVariant;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items",
        indexes = @Index(name = "idx_order_items_order_id", columnList = "order_id")
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    /** Snapshot — tên sản phẩm tại thời điểm mua */
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    /** Snapshot — "Đỏ / M" */
    @Column(name = "variant_info", nullable = false, length = 100)
    private String variantInfo;

    /** Snapshot — URL ảnh tại thời điểm mua */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Giá tại thời điểm mua */
    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Transient
    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}