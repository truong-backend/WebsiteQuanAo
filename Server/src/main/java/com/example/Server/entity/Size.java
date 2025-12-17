package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "size")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Size {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "name", length = 255, nullable = false, unique = true)
    private String name;
}