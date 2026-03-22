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

    /** Mã hex màu sắc (VD: #FFFFFF). */
    @Id
    @Column(length = 7)
    private String code;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "color")
    private List<ProductVariant> productVariants;
}
