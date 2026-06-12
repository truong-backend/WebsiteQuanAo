package com.example.fashionstore.service.size;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.size.SizeDto;
import com.example.fashionstore.dto.size.SizeRequest;
import com.example.fashionstore.module.size.Size;
import com.example.fashionstore.repository.size.SizeRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SizeService {

    private final SizeRepository sizeRepository;
    private final ProductVariantRepository productVariantRepository;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SizeDto> findAllActive() {
        return sizeRepository.findAllByActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toDto).toList();
    }

    /** Admin: trả tất cả kể cả đã soft-delete */
    @Transactional(readOnly = true)
    public List<SizeDto> findAll() {
        return sizeRepository.findAllIncludingDeleted()
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public SizeDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    // ── Write ───────────────────────────────────────────────────────

    public SizeDto create(SizeRequest req) {
        String normalizedCode = req.getCode().toUpperCase().trim();
        if (sizeRepository.existsByCode(normalizedCode))
            throw new BusinessException("Mã size '" + normalizedCode + "' đã tồn tại");

        if (sizeRepository.existsByName(req.getName().trim()))
            throw new BusinessException("Tên size '" + req.getName() + "' đã tồn tại");

        Size size = Size.builder()
                .code(normalizedCode)
                .name(req.getName().trim())
                .sortOrder(req.getSortOrder())
                .active(req.isActive())
                .build();

        return toDto(sizeRepository.save(size));
    }

    public SizeDto update(Long id, SizeRequest req) {
        Size size = findOrThrow(id);
        String normalizedCode = req.getCode().toUpperCase().trim();

        if (!size.getCode().equals(normalizedCode) && sizeRepository.existsByCode(normalizedCode))
            throw new BusinessException("Mã size '" + normalizedCode + "' đã tồn tại");

        if (!size.getName().equals(req.getName().trim()) && sizeRepository.existsByName(req.getName().trim()))
            throw new BusinessException("Tên size '" + req.getName() + "' đã tồn tại");

        size.setCode(normalizedCode);
        size.setName(req.getName().trim());
        size.setSortOrder(req.getSortOrder());
        size.setActive(req.isActive());

        return toDto(sizeRepository.save(size));
    }

    /**
     * Soft delete — chỉ ẩn size, không xóa vật lý
     */
    public void softDelete(Long id) {
        Size size = findOrThrow(id);
        boolean hasVariants = productVariantRepository.existsBySizeId(id);
        if (hasVariants)
            throw new BusinessException("Không thể xóa: kích cỡ đang có sản phẩm sử dụng");

        size.softDelete();
        sizeRepository.save(size);
    }

    /**
     * Hard delete — xóa vĩnh viễn, chỉ cho phép nếu không còn variant nào dùng
     */
    public void hardDelete(Long id) {
        Size size = findOrThrow(id);
        boolean hasVariants = productVariantRepository.existsBySizeId(id);
        if (hasVariants)
            throw new BusinessException("Không thể xóa vĩnh viễn: kích cỡ đang có sản phẩm sử dụng");

        sizeRepository.delete(size);
    }

    public SizeDto restore(Long id, SizeRequest req) {
        Size size = findOrThrow(id);
        size.restore();
        size.setCode(req.getCode().toUpperCase().trim());
        size.setName(req.getName().trim());
        size.setSortOrder(req.getSortOrder());
        size.setActive(true);
        return toDto(sizeRepository.save(size));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private Size findOrThrow(Long id) {
        return sizeRepository.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", id));
    }

    public SizeDto toDto(Size s) {
        return SizeDto.builder()
                .id(s.getId())
                .code(s.getCode())
                .name(s.getName())
                .sortOrder(s.getSortOrder())
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .deleted(s.isDeleted())
                .deletedAt(s.getDeletedAt())
                .build();
    }
}