package com.example.Server.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductType {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "type", length = 255, nullable = false)
    private String type;

    @Column(name = "subtype", length = 255, nullable = false)
    private String subtype;
}
