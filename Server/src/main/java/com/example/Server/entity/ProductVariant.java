package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "product_variant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "img", length = 255, nullable = false)
    private String img;

    // ====== Khóa ngoại ======

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "color_code", nullable = false)
    private Color color;

    @ManyToOne
    @JoinColumn(name = "size_code", nullable = false)
    private Size size;

    @OneToMany(mappedBy = "productVariant")
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "productVariant")
    private List<OrderItem> orderItems;
}
