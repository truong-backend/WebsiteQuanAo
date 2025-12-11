package com.example.Server.controller;

import com.example.Server.dto.DANHMUC.DanhMucDTO;
import com.example.Server.entity.DANHMUC;
import com.example.Server.mapper.DanhmucMapper;
import com.example.Server.service.DanhmucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/danhmuc")
public class DanhMucController {

    @Autowired
    private DanhmucService danhmucService;

    @Autowired
    private DanhmucMapper danhmucMapper;

    @GetMapping
    public List<DanhMucDTO> getAll() {
        List<DANHMUC> danhMucs = danhmucService.getAll(); // Lấy danh sách entity
        List<DanhMucDTO> dtos = new ArrayList<>(); // List DTO trả về

        for (DANHMUC entity : danhMucs) {
            DanhMucDTO dto = danhmucMapper.toDTO(entity); // map entity -> DTO
            dtos.add(dto); // thêm vào list
        }

        return dtos;
    }

    @GetMapping("/{id}")
    public DanhMucDTO getById(@PathVariable Long id) {
        return danhmucService.getById(id);
    }

    @PostMapping
    public DanhMucDTO create(@RequestBody DanhMucDTO dto) {
        DANHMUC entity = danhmucMapper.toEntity(dto);
        DANHMUC saved = danhmucService.create(entity);
        return danhmucMapper.toDTO(saved);
    }

    @PutMapping("/{id}")
    public DanhMucDTO update(@PathVariable Long id, @RequestBody DanhMucDTO dto) {
        DANHMUC entity = danhmucMapper.toEntity(dto);
        DANHMUC updated = danhmucService.update(id, entity);
        return danhmucMapper.toDTO(updated);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        danhmucService.delete(id);
        return "Xóa thành công";
    }
}
