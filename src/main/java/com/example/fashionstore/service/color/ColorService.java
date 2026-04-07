package com.example.fashionstore.service.color;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.color.ColorDto;
import com.example.fashionstore.dto.color.ColorRequest;
import com.example.fashionstore.module.color.Color;
import com.example.fashionstore.repository.color.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ColorService {

    private final ColorRepository colorRepository;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ColorDto> findAllActive() {
        return colorRepository.findAllByActiveTrueOrderByNameAsc()
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ColorDto> findAll() {
        return colorRepository.findAll()
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ColorDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    // ── Write ───────────────────────────────────────────────────────

    public ColorDto create(ColorRequest req) {
        String normalizedCode = req.getCode().toUpperCase();
        if (colorRepository.existsByCode(normalizedCode))
            throw new BusinessException("Mã màu '" + normalizedCode + "' đã tồn tại");

        if (colorRepository.existsByName(req.getName().trim()))
            throw new BusinessException("Tên màu '" + req.getName() + "' đã tồn tại");

        Color color = Color.builder()
                .code(normalizedCode)
                .name(req.getName().trim())
                .nameEn(req.getNameEn() != null ? req.getNameEn().trim() : null)
                .active(req.isActive())
                .build();

        return toDto(colorRepository.save(color));
    }

    public ColorDto update(Long id, ColorRequest req) {
        Color color = findOrThrow(id);
        String normalizedCode = req.getCode().toUpperCase();

        // Check code conflict (trừ chính nó)
        if (!color.getCode().equals(normalizedCode) && colorRepository.existsByCode(normalizedCode))
            throw new BusinessException("Mã màu '" + normalizedCode + "' đã tồn tại");

        // Check name conflict
        if (!color.getName().equals(req.getName().trim()) && colorRepository.existsByName(req.getName().trim()))
            throw new BusinessException("Tên màu '" + req.getName() + "' đã tồn tại");

        color.setCode(normalizedCode);
        color.setName(req.getName().trim());
        color.setNameEn(req.getNameEn() != null ? req.getNameEn().trim() : null);
        color.setActive(req.isActive());

        return toDto(colorRepository.save(color));
    }

    public void delete(Long id) {
        Color color = findOrThrow(id);
        // Soft delete — không hard delete vì variant có thể đang dùng colorCode
        color.setActive(false);
        colorRepository.save(color);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private Color findOrThrow(Long id) {
        return colorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", id));
    }

    public ColorDto toDto(Color c) {
        return ColorDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .nameEn(c.getNameEn())
                .active(c.isActive())
                .createdAt(c.getCreatedAt())
                .build();
    }
}