package com.example.Server.services;

import com.example.Server.dto.request.size.SizeCreateRequest;
import com.example.Server.dto.request.size.SizeUpdateRequest;
import com.example.Server.dto.response.size.SizeResponse;
import com.example.Server.entity.Size;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.SizeMapper;
import com.example.Server.repository.SizeRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class SizeService {

    private final SizeRepository sizeRepository;

    public SizeService(SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }

    /**
     * Find all sizes with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<SizeResponse> findAll(
            Pageable pageable,
            String search
    ) {
        Specification<Size> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")), keyword)
            );
        }

        return sizeRepository
                .findAll(spec, pageable)
                .map(SizeMapper::toResponse);
    }

    /**
     * Create a new size
     */
    public SizeResponse create(SizeCreateRequest request) {
        String sizeName = normalizeName(request.getName());

        if (sizeRepository.existsByName(sizeName)) {
            throw new ResourceAlreadyExistsException(
                    "Size",
                    "name",
                    sizeName
            );
        }

        Size size = new Size();
        size.setId(request.getId());
        size.setName(sizeName);

        Size saved = sizeRepository.save(size);
        return SizeMapper.toResponse(saved);
    }

    /**
     * Update an existing size
     */
    public SizeResponse update(String id, SizeUpdateRequest request) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Size",
                        "id",
                        id
                ));

        String sizeName = normalizeName(request.getName());

        if (sizeRepository.existsByNameAndIdNot(sizeName, id)) {
            throw new ResourceAlreadyExistsException(
                    "Size",
                    "name",
                    sizeName
            );
        }

        size.setName(sizeName);

        Size saved = sizeRepository.save(size);
        return SizeMapper.toResponse(saved);
    }

    /**
     * Delete a size by ID
     */
    public void delete(String id) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Size", "id", id)
                );

        if (size.getProductVariants() != null
                && !size.getProductVariants().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete size that is being used in product variants. Please remove or reassign product variants first."
            );
        }

        sizeRepository.delete(size);
    }

    /**
     * Get size by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public SizeResponse getById(String id) {
        Size size = sizeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Size", "id", id)
                );
        return SizeMapper.toResponse(size);
    }

    /**
     * Normalize size name (trim + single space)
     */
    private String normalizeName(String name) {
        return name == null
                ? null
                : name.trim().replaceAll("\\s+", " ");
    }
}
