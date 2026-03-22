package com.example.Server.service;

import com.example.Server.dto.request.color.*;
import com.example.Server.dto.response.color.*;
import com.example.Server.entity.Color;
import com.example.Server.exception.*;
import com.example.Server.mapper.*;
import com.example.Server.repository.ColorRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;

/** Service quản lý màu sắc sản phẩm. */
@Service @Transactional
public class ColorService {
    private final ColorRepository colorRepository;
    public ColorService(ColorRepository colorRepository) { this.colorRepository = colorRepository; }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ColorOptionResponse> getAllColorOptions() { return ColorOptionMapper.toResponses(colorRepository.findAll()); }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ColorResponse> findAll(Pageable pageable, String search) {
        Specification<Color> spec = (root, q, cb) -> cb.conjunction();
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("name")), kw));
        }
        return colorRepository.findAll(spec, pageable).map(ColorMapper::toResponse);
    }

    public ColorResponse create(ColorCreateRequest request) {
        String code = request.getCode() == null ? null : request.getCode().trim().toUpperCase();
        String name = normalize(request.getName());
        if (colorRepository.existsById(code))  throw new ResourceAlreadyExistsException("Color", "code", code);
        if (colorRepository.existsByName(name)) throw new ResourceAlreadyExistsException("Color", "name", name);
        Color color = new Color(); color.setCode(code); color.setName(name);
        return ColorMapper.toResponse(colorRepository.save(color));
    }

    public ColorResponse update(String code, ColorUpdateRequest request) {
        Color color = colorRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("Color", "code", code));
        String name = normalize(request.getName());
        if (colorRepository.existsByNameAndCodeNot(name, code))
            throw new ResourceAlreadyExistsException("Color", "name", name);
        color.setName(name);
        return ColorMapper.toResponse(colorRepository.save(color));
    }

    public void delete(String code) {
        Color color = colorRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("Color", "code", code));
        if (color.getProductVariants() != null && !color.getProductVariants().isEmpty())
            throw new InvalidOperationException("Cannot delete color that is in use by product variants.");
        colorRepository.delete(color);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ColorResponse getByCode(String code) {
        return ColorMapper.toResponse(colorRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("Color", "code", code)));
    }

    private String normalize(String s) { return s == null ? null : s.trim().replaceAll("\\s+", " "); }
}
