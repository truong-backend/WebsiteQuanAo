package com.example.Server.mapper;

import com.example.Server.dto.DANHMUC.DanhMucRequest;
import com.example.Server.dto.DANHMUC.DanhMucResponse;
import com.example.Server.entity.DANHMUC;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DanhmucMapper {

    public DANHMUC toEntity(DanhMucRequest dto) {
        DANHMUC entity = new DANHMUC();
        entity.setTenDanhMuc(dto.getTenDanhMuc());
        return entity;
    }

    public DanhMucResponse toResponse(DANHMUC entity) {
        DanhMucResponse dto = new DanhMucResponse();

        dto.setMaDanhMuc(entity.getMaDanhMuc());
        dto.setTenDanhMuc(entity.getTenDanhMuc());

        dto.setMaDanhMucCha(
                entity.getDanhMucCha() == null ? null : entity.getDanhMucCha().getMaDanhMuc()
        );

        if (entity.getDanhMucCon() != null) {
            dto.setDanhMucCon(
                    entity.getDanhMucCon().stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    public void updateEntity(DANHMUC entity, DanhMucRequest dto) {
        entity.setTenDanhMuc(dto.getTenDanhMuc());
    }
}
