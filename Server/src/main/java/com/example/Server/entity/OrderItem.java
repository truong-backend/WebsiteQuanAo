package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private Integer quantity;

    /** Giá snapshot tại thời điểm đặt hàng (không bị ảnh hưởng khi giá sản phẩm thay đổi). */
    @Column(nullable = false)
    private Double price;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;
}
