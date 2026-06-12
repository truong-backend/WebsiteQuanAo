package com.example.fashionstore.service.color;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.color.ColorDto;
import com.example.fashionstore.dto.color.ColorRequest;
import com.example.fashionstore.module.color.Color;
import com.example.fashionstore.repository.color.ColorRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ColorService {

    private final ColorRepository colorRepository;
    private final ProductVariantRepository productVariantRepository;

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

        if (!color.getCode().equals(normalizedCode) && colorRepository.existsByCode(normalizedCode))
            throw new BusinessException("Mã màu '" + normalizedCode + "' đã tồn tại");

        if (!color.getName().equals(req.getName().trim()) && colorRepository.existsByName(req.getName().trim()))
            throw new BusinessException("Tên màu '" + req.getName() + "' đã tồn tại");

        color.setCode(normalizedCode);
        color.setName(req.getName().trim());
        color.setNameEn(req.getNameEn() != null ? req.getNameEn().trim() : null);
        color.setActive(req.isActive());

        return toDto(colorRepository.save(color));
    }

    /**
     * Soft delete — chỉ ẩn màu, không xóa vật lý vì variant có thể đang dùng
     */
    public void softDelete(Long id) {
        Color color = findOrThrow(id);
        boolean hasVariants = productVariantRepository.existsByColorId(id);
        if (hasVariants)
            throw new BusinessException("Không thể xóa: màu sắc đang có sản phẩm sử dụng");

        color.softDelete();
        colorRepository.save(color);
    }

    /**
     * Hard delete — xóa vĩnh viễn, chỉ cho phép nếu không còn variant nào dùng
     */
    public void hardDelete(Long id) {
        Color color = findOrThrow(id);
        boolean hasVariants = productVariantRepository.existsByColorId(id);
        if (hasVariants)
            throw new BusinessException("Không thể xóa vĩnh viễn: màu sắc đang có sản phẩm sử dụng");

        colorRepository.delete(color);
    }

    public ColorDto restore(Long id, ColorRequest req) {
        Color color = findOrThrow(id);
        color.restore();
        color.setCode(req.getCode().toUpperCase());
        color.setName(req.getName().trim());
        color.setNameEn(req.getNameEn() != null ? req.getNameEn().trim() : null);
        color.setActive(true);
        return toDto(colorRepository.save(color));
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