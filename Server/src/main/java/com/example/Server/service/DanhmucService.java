package com.example.Server.service;

import com.example.Server.dto.DANHMUC.DanhMucDTO;
import com.example.Server.dto.DANHMUC.DanhMucRequest;
import com.example.Server.dto.DANHMUC.DanhMucResponse;
import com.example.Server.entity.DANHMUC;
import com.example.Server.exception.NotFoundException;
import com.example.Server.mapper.DanhmucMapper;
import com.example.Server.repository.DanhmucRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DanhmucService {

    private final DanhmucRepository danhmucRepository;
    private final DanhmucMapper danhmucMapper;

    public List<DANHMUC> getAll() {
        return danhmucRepository.findAll();
    }

    public DanhMucResponse getById(Long id) {
        DANHMUC entity = danhmucRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Danh mục không tồn tại"));
        return danhmucMapper.toResponse(entity);
    }

    public DanhMucResponse create(DanhMucRequest dto) {

        DANHMUC entity = danhmucMapper.toEntity(dto);

        if (dto.getMaDanhMucCha() != null) {
            DANHMUC parent = danhmucRepository.findById(dto.getMaDanhMucCha())
                    .orElseThrow(() -> new NotFoundException("Danh mục cha không tồn tại"));
            entity.setDanhMucCha(parent);
        }

        DANHMUC saved = danhmucRepository.save(entity);
        return danhmucMapper.toResponse(saved);
    }

    public DanhMucResponse update(Long id, DanhMucRequest dto) {

        DANHMUC entity = danhmucRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục để update"));

        danhmucMapper.updateEntity(entity, dto);

        if (dto.getMaDanhMucCha() != null) {
            DANHMUC parent = danhmucRepository.findById(dto.getMaDanhMucCha())
                    .orElseThrow(() -> new NotFoundException("Danh mục cha không tồn tại"));
            entity.setDanhMucCha(parent);
        } else {
            entity.setDanhMucCha(null);
        }

        return danhmucMapper.toResponse(danhmucRepository.save(entity));
    }

    public void delete(Long id) {
        if (!danhmucRepository.existsById(id)) {
            throw new NotFoundException("Danh mục không tồn tại");
        }
        danhmucRepository.deleteById(id);
    }
}
