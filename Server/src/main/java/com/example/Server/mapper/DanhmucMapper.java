package com.example.Server.mapper;

import com.example.Server.dto.DANHMUC.DanhMucDTO;
import com.example.Server.dto.DANHMUC.DanhMucInputDTO;
import com.example.Server.entity.DANHMUC;
import com.example.Server.service.DanhmucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DanhmucMapper {
    public DanhmucService danhmucService;

    // Chuyển entity -> DTO
    public DanhMucDTO toDTO(DANHMUC entity) {
        if (entity == null) return null;

        DanhMucDTO dto = new DanhMucDTO();
        dto.setMaDanhMuc(entity.getMaDanhMuc());
        dto.setTenDanhMuc(entity.getTenDanhMuc());

        if (entity.getDanhMucCha() != null) {
            dto.setMaDanhMucCha(entity.getDanhMucCha().getMaDanhMuc());
        }

        if (entity.getDanhMucCon() != null && !entity.getDanhMucCon().isEmpty()) {
            List<DanhMucDTO> conList = new ArrayList<>();
            for (DANHMUC child : entity.getDanhMucCon()) {
                conList.add(toDTO(child)); // đệ quy
            }
            dto.setDanhMucCon(conList);
        }

        return dto;
    }

    public DANHMUC toEntity(DanhMucDTO dto) {
        DANHMUC entity = new DANHMUC();
        entity.setTenDanhMuc(dto.getTenDanhMuc());
        DanhMucDTO danhmuc = danhmucService.getById(dto.getMaDanhMucCha());
        entity.setDanhMucCha(this.toEntity(danhmuc));
        return entity;
    }
}
