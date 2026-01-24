package com.example.Server.services;

import com.example.Server.dto.request.productType.ProductTypeCreateRequest;
import com.example.Server.dto.request.productType.ProductTypeUpdateRequest;
import com.example.Server.dto.response.productType.ProductTypeResponse;
import com.example.Server.entity.ProductType;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.ProductTypeMapper;
import com.example.Server.repository.ProductTypeRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ProductTypeService {

    private final ProductTypeRepository productTypeRepository;

    public ProductTypeService(ProductTypeRepository productTypeRepository) {
        this.productTypeRepository = productTypeRepository;
    }

    /**
     * Find all product types with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductTypeResponse> findAll(Pageable pageable, String search) {
        Specification<ProductType> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("productName")), keyword)
            );
        }

        return productTypeRepository
                .findAll(spec, pageable)
                .map(ProductTypeMapper::toResponse);
    }

    /**
     * Create a new product type
     */
    public ProductTypeResponse create(ProductTypeCreateRequest request) {
        ProductType pt = new ProductType();
        pt.setProductName(normalize(request.getProductName()));

//        if (request.getParentProductId() != null) {
//            ProductType parent = productTypeRepository.findById(request.getParentProductId())
//                    .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", request.getParentProductId()));
//            pt.setParentProduct(parent);
//        } else {
//            pt.setParentProduct(null);
//        }

        ProductType saved = productTypeRepository.save(pt);
        return ProductTypeMapper.toResponse(saved);
    }

    /**
     * Update an existing product type
     */
    public ProductTypeResponse update(Long id, ProductTypeUpdateRequest request) {
        ProductType pt = productTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", id));

        pt.setProductName(normalize(request.getProductName()));

//        if (request.getParentProductId() != null) {
//            if (request.getParentProductId().equals(id)) {
//                throw new InvalidOperationException("Product type cannot be its own parent.");
//            }
//            ProductType parent = productTypeRepository.findById(request.getParentProductId())
//                    .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", request.getParentProductId()));
//            pt.setParentProduct(parent);
//        } else {
//            pt.setParentProduct(null);
//        }

        ProductType saved = productTypeRepository.save(pt);
        return ProductTypeMapper.toResponse(saved);
    }

    /**
     * Delete a product type by ID
     */
    public void delete(Long id) {
        ProductType pt = productTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", id));

//        if (pt.getProducts() != null && !pt.getProducts().isEmpty()) {
//            throw new InvalidOperationException(
//                    "Cannot delete product type that has products. Please remove or reassign products first."
//            );
//        }

        productTypeRepository.delete(pt);
    }

    /**
     * Get product type by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductTypeResponse getById(Long id) {
        ProductType pt = productTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", id));
        return ProductTypeMapper.toResponse(pt);
    }

    private String normalize(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }
}
