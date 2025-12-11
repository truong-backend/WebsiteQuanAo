package com.example.Server.service;

import com.example.Server.dto.DANHMUC.DanhMucDTO;
import com.example.Server.entity.DANHMUC;
import com.example.Server.mapper.DanhmucMapper;
import com.example.Server.repository.DanhmucRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DanhmucService {

    @Autowired
    private DanhmucRepository danhmucRepository;

    @Autowired
    private DanhmucMapper danhmucMapper;

    public List<DANHMUC> getAll() {
        return danhmucRepository.findAll();
    }

    public DanhMucDTO getById(Long id) {
        return danhmucMapper.toDTO(danhmucRepository.findById(id).get());

    }

    public DANHMUC create(DANHMUC danhMuc) {
        return danhmucRepository.save(danhMuc);
    }

    public DANHMUC update(Long id, DANHMUC danhMuc) {
        danhMuc.setMaDanhMuc(id);
        return danhmucRepository.save(danhMuc);
    }

    public void delete(Long id) {
        danhmucRepository.deleteById(id);
    }
}
