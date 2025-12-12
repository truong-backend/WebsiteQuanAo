package com.example.Server.controller;

import com.example.Server.dto.DANHMUC.DanhMucDTO;
import com.example.Server.dto.DANHMUC.DanhMucRequest;
import com.example.Server.dto.DANHMUC.DanhMucResponse;
import com.example.Server.entity.DANHMUC;
import com.example.Server.mapper.DanhmucMapper;
import com.example.Server.service.DanhmucService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/danhmuc")
@RequiredArgsConstructor
public class DanhMucController {

    private final DanhmucService danhmucService;
    private final DanhmucMapper danhmucMapper;

    @GetMapping
    public List<DanhMucResponse> getAll() {
        return danhmucService.getAll().stream()
                .map(danhmucMapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public DanhMucResponse getById(@PathVariable Long id) {
        return danhmucService.getById(id);
    }

    @PostMapping
    public DanhMucResponse create(@RequestBody DanhMucRequest request) {
        return danhmucService.create(request);
    }

    @PutMapping("/{id}")
    public DanhMucResponse update(@PathVariable Long id,
                                  @RequestBody DanhMucRequest request) {
        return danhmucService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        danhmucService.delete(id);
        return "Xóa thành công";
    }
}
