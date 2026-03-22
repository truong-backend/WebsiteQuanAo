package com.example.Server.service;

import com.example.Server.dto.request.size.*;
import com.example.Server.dto.response.size.*;
import com.example.Server.entity.Size;
import com.example.Server.exception.*;
import com.example.Server.mapper.*;
import com.example.Server.repository.SizeRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

/** Service quản lý kích thước sản phẩm. */
@Service @Transactional
public class SizeService {
    private final SizeRepository sizeRepository;
    public SizeService(SizeRepository sizeRepository) { this.sizeRepository = sizeRepository; }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<SizeOptionResponse> getAllSizeOptions() { return SizeOptionMapper.toResponses(sizeRepository.findAll()); }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<SizeResponse> findAll(Pageable pageable, String search) {
        Specification<Size> spec = (root, q, cb) -> cb.conjunction();
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("name")), kw));
        }
        return sizeRepository.findAll(spec, pageable).map(SizeMapper::toResponse);
    }

    public SizeResponse create(SizeCreateRequest request) {
        String name = normalize(request.getName());
        if (sizeRepository.existsByName(name)) throw new ResourceAlreadyExistsException("Size", "name", name);
        String id = (request.getId() != null && !request.getId().isBlank()) ? request.getId().trim() : UUID.randomUUID().toString();
        Size size = new Size(); size.setId(id); size.setName(name);
        return SizeMapper.toResponse(sizeRepository.save(size));
    }

    public SizeResponse update(String id, SizeUpdateRequest request) {
        Size size = sizeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size", "id", id));
        String name = normalize(request.getName());
        if (sizeRepository.existsByNameAndIdNot(name, id)) throw new ResourceAlreadyExistsException("Size", "name", name);
        size.setName(name);
        return SizeMapper.toResponse(sizeRepository.save(size));
    }

    public void delete(String id) {
        Size size = sizeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size", "id", id));
        if (size.getProductVariants() != null && !size.getProductVariants().isEmpty())
            throw new InvalidOperationException("Cannot delete size that is in use by product variants.");
        sizeRepository.delete(size);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public SizeResponse getById(String id) {
        return SizeMapper.toResponse(sizeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", id)));
    }

    private String normalize(String s) { return s == null ? null : s.trim().replaceAll("\\s+", " "); }
}
