package com.example.Server.services;

import com.example.Server.dto.request.color.ColorCreateRequest;
import com.example.Server.dto.request.color.ColorUpdateRequest;
import com.example.Server.dto.response.color.ColorOptionResponse;
import com.example.Server.dto.response.color.ColorResponse;
import com.example.Server.entity.Color;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.ColorMapper;
import com.example.Server.repository.ColorRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ColorService {

    private final ColorRepository colorRepository;

    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    /**
     * Find all colors with pagination, search, and filtering
     */

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ColorOptionResponse> getAllColorOptions() {
        return ColorMapper.toOptionResponseList(
                colorRepository.findAll()
        );
    }
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ColorResponse> findAll(
            Pageable pageable,
            String search
    ) {
        Specification<Color> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")), keyword)
            );
        }

        return colorRepository
                .findAll(spec, pageable)
                .map(ColorMapper::toResponse);
    }

    /**
     * Create a new color
     */
    public ColorResponse create(ColorCreateRequest request) {
        String colorName = normalizeName(request.getName());
        String colorCode = normalizeCode(request.getCode());

        if (colorRepository.existsById(colorCode)) {
            throw new ResourceAlreadyExistsException(
                    "Color",
                    "code",
                    colorCode
            );
        }

        if (colorRepository.existsByName(colorName)) {
            throw new ResourceAlreadyExistsException(
                    "Color",
                    "name",
                    colorName
            );
        }

        Color color = new Color();
        color.setCode(colorCode);
        color.setName(colorName);

        Color saved = colorRepository.save(color);
        return ColorMapper.toResponse(saved);
    }

    /**
     * Update an existing color
     */
    public ColorResponse update(String code, ColorUpdateRequest request) {
        Color color = colorRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Color",
                        "code",
                        code
                ));

        String colorName = normalizeName(request.getName());

        if (colorRepository.existsByNameAndCodeNot(colorName, code)) {
            throw new ResourceAlreadyExistsException(
                    "Color",
                    "name",
                    colorName
            );
        }

        color.setName(colorName);

        Color saved = colorRepository.save(color);
        return ColorMapper.toResponse(saved);
    }

    /**
     * Delete a color by code
     */
    public void delete(String code) {
        Color color = colorRepository.findById(code)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Color", "code", code)
                );

        if (color.getProductVariants() != null
                && !color.getProductVariants().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete color that is being used in product variants. Please remove or reassign product variants first."
            );
        }

        colorRepository.delete(color);
    }

    /**
     * Get color by code
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public ColorResponse getByCode(String code) {
        Color color = colorRepository.findById(code)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Color", "code", code)
                );
        return ColorMapper.toResponse(color);
    }

    /**
     * Normalize color name (trim + single space)
     */
    private String normalizeName(String name) {
        return name == null
                ? null
                : name.trim().replaceAll("\\s+", " ");
    }

    /**
     * Normalize color code (trim + uppercase)
     */
    private String normalizeCode(String code) {
        return code == null
                ? null
                : code.trim().toUpperCase();
    }
}
