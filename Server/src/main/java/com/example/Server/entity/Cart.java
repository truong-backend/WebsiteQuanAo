package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @Column(name = "id", length = 36)
    private String id;
    @OneToOne
    @JoinColumn(name = "user_id")
    private Account user;
}
