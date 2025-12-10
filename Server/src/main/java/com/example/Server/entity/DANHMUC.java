package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "DANHMUC")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DANHMUC {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madanhmuc")
    private Long maDanhMuc;

    @Column(name = "tendanhmuc", nullable = false)
    private String tenDanhMuc;

    @ManyToOne
    @JoinColumn(name = "madanhmuccha")
    private DANHMUC danhMucCha;

    @OneToMany(mappedBy = "danhMucCha", cascade = CascadeType.ALL)
    private List<DANHMUC> danhMucCon;
}
