package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private Double price;

    /** Giá sau giảm — null nếu không áp dụng khuyến mãi. */
    @Column(name = "sale_price")
    private Double salePrice;

    @Column(nullable = false)
    private String path;

    @Column(nullable = false)
    private String img;

    @Column(name = "hover_img")
    private String hoverImg;

    /** Điểm đánh giá trung bình (0.0 – 5.0). */
    private Double rating;

    /** Tổng số lượt đánh giá. */
    private Integer ratingCount;

    @ManyToOne
    @JoinColumn(name = "parent_category_id", nullable = false)
    private Category parentCategory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariant> variants;
}
