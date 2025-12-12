package com.example.Server.mapper;

import com.example.Server.dto.BANNER.BannerDTO;
import com.example.Server.entity.BANNER;

public class BannerMapper {

    // Entity → DTO
    public static BannerDTO toDTO(BANNER entity) {
        if (entity == null) return null;

        BannerDTO dto = new BannerDTO();
        dto.setMaBanner(entity.getMaBanner());
        dto.setTenBanner(entity.getTenBanner());
        dto.setDuongDan(entity.getDuongDan());
        return dto;
    }

    // DTO → Entity (dùng khi tạo mới hoặc cập nhật)
    public static BANNER toEntity(BannerDTO dto) {
        if (dto == null) return null;

        BANNER entity = new BANNER();
        entity.setMaBanner(dto.getMaBanner());   // Nếu null → JPA tự tăng
        entity.setTenBanner(dto.getTenBanner());
        entity.setDuongDan(dto.getDuongDan());
        return entity;
    }

    // Hàm cập nhật Entity từ DTO (dùng cho update)
    public static void updateEntity(BANNER entity, BannerDTO dto) {
        if (entity == null || dto == null) return;

        entity.setTenBanner(dto.getTenBanner());
        entity.setDuongDan(dto.getDuongDan());
    }
}
