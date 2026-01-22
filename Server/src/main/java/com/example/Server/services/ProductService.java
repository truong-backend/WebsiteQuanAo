package com.example.Server.services;

import com.example.Server.dto.request.product.ProductCreateRequest;
import com.example.Server.dto.request.product.ProductUpdateRequest;
import com.example.Server.dto.response.product.ProductResponse;
import com.example.Server.entity.Product;
import com.example.Server.entity.ProductType;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.ProductMapper;
import com.example.Server.repository.ProductRepository;
import com.example.Server.repository.ProductTypeRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;

    public ProductService(
            ProductRepository productRepository,
            ProductTypeRepository productTypeRepository
    ) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
    }

    /**
     * Find all products with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductResponse> findAll(Pageable pageable, String search) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("id")), keyword),
                            cb.like(cb.lower(root.get("name")), keyword),
                            cb.like(cb.lower(root.get("description")), keyword),
                            cb.like(cb.lower(root.get("path")), keyword),
                            cb.like(cb.lower(root.get("img")), keyword)
                    )
            );
        }

        return productRepository
                .findAll(spec, pageable)
                .map(ProductMapper::toResponse);
    }

    /**
     * Create a new product
     */
    public ProductResponse create(ProductCreateRequest request) {
        ProductType productType = productTypeRepository.findById(request.getProductTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", request.getProductTypeId()));

        String id = request.getId() != null && !request.getId().trim().isEmpty()
                ? request.getId().trim()
                : UUID.randomUUID().toString();

        if (productRepository.existsById(id)) {
            throw new ResourceAlreadyExistsException("Product", "id", id);
        }

        Product product = new Product();
        product.setId(id);
        product.setName(normalize(request.getName()));
        product.setDescription(normalize(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setPath(request.getPath().trim());
        product.setImg(request.getImg().trim());
        product.setHoverImg(request.getHoverImg() != null && !request.getHoverImg().trim().isEmpty() ? request.getHoverImg().trim() : null);
        product.setProductType(productType);

        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    /**
     * Update an existing product
     */
    public ProductResponse update(String id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        ProductType productType = productTypeRepository.findById(request.getProductTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductType", "id", request.getProductTypeId()));

        product.setName(normalize(request.getName()));
        product.setDescription(normalize(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setPath(request.getPath().trim());
        product.setImg(request.getImg().trim());
        product.setHoverImg(request.getHoverImg() != null && !request.getHoverImg().trim().isEmpty() ? request.getHoverImg().trim() : null);
        product.setProductType(productType);

        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    /**
     * Delete a product by ID
     */
    public void delete(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete product that has variants. Please remove or reassign product variants first."
            );
        }

        productRepository.delete(product);
    }

    /**
     * Get product by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductResponse getById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ProductMapper.toResponse(product);
    }

    private String normalize(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }
}
