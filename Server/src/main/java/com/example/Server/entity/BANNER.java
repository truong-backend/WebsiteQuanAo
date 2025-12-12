package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "BANNER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BANNER {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mabanner")
    private Long maBanner;

    @Column(name = "tenbanner", nullable = false)
    private String tenBanner;

    @Column(name = "duongdan", nullable = false)
    private String duongDan;
}
