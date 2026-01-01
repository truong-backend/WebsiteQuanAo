package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "color")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Color {

    @Id
    @Column(name = "code", length = 7)
    private String code; // Mã hex màu (VD: #FFFFFF)

    @Column(name = "name", length = 255, nullable = false, unique = true)
    private String name; // Tên màu

    @OneToMany(mappedBy = "color")
    private List<ProductVariant> productVariants;

}