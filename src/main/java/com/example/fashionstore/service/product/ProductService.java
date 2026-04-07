package com.example.fashionstore.service.product;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.product.*;
import com.example.fashionstore.mapper.product.ProductMapper;
import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.module.product.Product;
import com.example.fashionstore.repository.category.CategoryRepository;
import com.example.fashionstore.repository.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository    categoryRepository;
    private final ProductMapper productMapper;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductListDto> findAll(Pageable pageable, ProductFilterDto filter) {
        Specification<Product> spec = ProductSpec.build(filter);
        return productRepository.findAll(spec, pageable).map(productMapper::toListDto);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductDetailDto getDetailById(String id) {
        Product p = productRepository.findByIdWithVariants(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toDetailDto(p);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductDetailDto getDetailBySlug(String slug) {
        Product p = productRepository.findBySlugWithVariants(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return productMapper.toDetailDto(p);
    }

    // ── Write ───────────────────────────────────────────────────────

    public ProductDetailDto create(ProductCreateRequest req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getCategoryId()));

        if (productRepository.existsBySlug(req.getSlug()))
            throw new BusinessException("Slug '" + req.getSlug() + "' đã tồn tại");

        Product product = Product.builder()
                .id(UUID.randomUUID().toString())
                .name(req.getName().trim())
                .slug(req.getSlug().trim())
                .description(req.getDescription())
                .basePrice(req.getBasePrice())
                .salePrice(req.getSalePrice())
                .mainImage(req.getMainImage())
                .hoverImage(req.getHoverImage())
                .category(category)
                .build();

        return productMapper.toDetailDto(productRepository.save(product));
    }

    public ProductDetailDto update(String id, ProductUpdateRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getCategoryId()));

        // Kiểm tra slug conflict (nếu đổi slug)
        if (!product.getSlug().equals(req.getSlug()) && productRepository.existsBySlug(req.getSlug()))
            throw new BusinessException("Slug '" + req.getSlug() + "' đã tồn tại");

        product.setName(req.getName().trim());
        product.setSlug(req.getSlug().trim());
        product.setDescription(req.getDescription());
        product.setBasePrice(req.getBasePrice());
        product.setSalePrice(req.getSalePrice());
        product.setMainImage(req.getMainImage());
        product.setHoverImage(req.getHoverImage());
        product.setCategory(category);
        product.setActive(req.isActive());

        return productMapper.toDetailDto(productRepository.save(product));
    }

    public void delete(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        if (!product.getVariants().isEmpty())
            throw new BusinessException("Không thể xóa sản phẩm đang có variants. Hãy xóa variants trước.");
        productRepository.delete(product);
    }
}