package com.example.Server.dto.DANHMUC;

import lombok.Data;

import java.util.List;

@Data
public class DanhMucDTO {
    private Long maDanhMuc;
    private String tenDanhMuc;
    private Long maDanhMucCha;
    private List<DanhMucDTO> danhMucCon;
}
