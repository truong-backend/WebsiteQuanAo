package com.example.Server.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "product_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long productId;

    @Column(name = "category_name", nullable = false)
    private String productName;

//    @ManyToOne
//    @JoinColumn(name = "parent_category_id")
//    private ProductType parentProduct;

//    @OneToMany(mappedBy = "productType")
//    private List<Product> products;
}
