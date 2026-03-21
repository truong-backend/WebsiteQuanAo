package com.example.Server.service;

import com.example.Server.dto.request.product.*;
import com.example.Server.dto.response.product.*;
import com.example.Server.entity.*;
import com.example.Server.exception.*;
import com.example.Server.mapper.*;
import com.example.Server.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

/** Service quản lý sản phẩm. */
@Service @Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UploadService uploadService;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          UploadService uploadService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.uploadService = uploadService;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ProductOptionResponse> getAllProductOptions() { return ProductOptionMapper.toResponses(productRepository.findAll()); }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductResponse> findAll(Pageable pageable, String search) {
        Specification<Product> spec = (root, q, cb) -> cb.conjunction();
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), kw),
                    cb.like(cb.lower(root.get("description")), kw)));
        }
        return productRepository.findAll(spec, pageable).map(ProductMapper::toResponse);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductListItemResponse> findAllWithFilters(Pageable pageable, String search,
            Integer categoryId, Double minPrice, Double maxPrice) {
        Specification<Product> spec = (root, q, cb) -> cb.conjunction();
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), kw), cb.like(cb.lower(root.get("description")), kw)));
        }
        if (categoryId != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("parentCategory").get("categoryId"), categoryId));
        if (minPrice != null)
            spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        if (maxPrice != null)
            spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        return productRepository.findAll(spec, pageable).map(ProductListItemMapper::toResponse);
    }

    public ProductResponse create(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        String id = (request.getId() != null && !request.getId().isBlank()) ? request.getId().trim() : UUID.randomUUID().toString();
        if (productRepository.existsById(id)) throw new ResourceAlreadyExistsException("Product", "id", id);

        Product p = new Product(); p.setId(id); p.setName(normalize(request.getName()));
        p.setDescription(normalize(request.getDescription())); p.setPrice(request.getPrice());
        p.setPath(request.getPath().trim()); p.setImg(request.getImg().trim());
        p.setHoverImg(request.getHoverImg() != null && !request.getHoverImg().isBlank() ? request.getHoverImg().trim() : null);
        p.setParentCategory(category);
        return ProductMapper.toResponse(productRepository.save(p));
    }

    public ProductResponse update(String id, ProductUpdateRequest request) {
        Product p = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        Category category = categoryRepository.findById(request.getProductTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getProductTypeId()));
        p.setName(normalize(request.getName())); p.setDescription(normalize(request.getDescription()));
        p.setPrice(request.getPrice()); p.setPath(request.getPath().trim()); p.setImg(request.getImg().trim());
        p.setHoverImg(request.getHoverImg() != null && !request.getHoverImg().trim().isEmpty() ? request.getHoverImg().trim() : null);
        p.setParentCategory(category);
        return ProductMapper.toResponse(productRepository.save(p));
    }

    public void delete(String id) {
        Product p = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        if (p.getVariants() != null && !p.getVariants().isEmpty())
            throw new InvalidOperationException("Cannot delete product that has variants.");
        uploadService.deleteImage(p.getImg());
        productRepository.delete(p);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductDetailResponse getDetailById(String id) {
        return ProductDetailMapper.toDetailResponse(productRepository.findByIdWithVariants(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id)));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductDetailResponse getDetailByPath(String path) {
        return ProductDetailMapper.toDetailResponse(productRepository.findByPathWithVariants(path)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "path", path)));
    }

    private String normalize(String s) { return s == null ? null : s.trim().replaceAll("\\s+", " "); }
}
