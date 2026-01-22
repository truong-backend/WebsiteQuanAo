package com.example.Server.services;

import com.example.Server.dto.request.productVariant.ProductVariantCreateRequest;
import com.example.Server.dto.request.productVariant.ProductVariantUpdateRequest;
import com.example.Server.dto.response.productVariant.ProductVariantResponse;
import com.example.Server.entity.Color;
import com.example.Server.entity.Product;
import com.example.Server.entity.ProductVariant;
import com.example.Server.entity.Size;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.ProductVariantMapper;
import com.example.Server.repository.ColorRepository;
import com.example.Server.repository.ProductRepository;
import com.example.Server.repository.ProductVariantRepository;
import com.example.Server.repository.SizeRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;

    public ProductVariantService(
            ProductVariantRepository productVariantRepository,
            ProductRepository productRepository,
            ColorRepository colorRepository,
            SizeRepository sizeRepository
    ) {
        this.productVariantRepository = productVariantRepository;
        this.productRepository = productRepository;
        this.colorRepository = colorRepository;
        this.sizeRepository = sizeRepository;
    }

    /**
     * Find all product variants with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductVariantResponse> findAll(Pageable pageable, String search) {
        Specification<ProductVariant> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("id")), keyword),
                            cb.like(cb.lower(root.get("img")), keyword),
                            cb.like(cb.lower(root.get("product").get("name")), keyword)
                    )
            );
        }

        return productVariantRepository
                .findAll(spec, pageable)
                .map(ProductVariantMapper::toResponse);
    }

    /**
     * Create a new product variant
     */
    public ProductVariantResponse create(ProductVariantCreateRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));
        Color color = colorRepository.findById(request.getColorCode())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "code", request.getColorCode()));
        Size size = sizeRepository.findById(request.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", request.getSizeId()));

        if (productVariantRepository.existsByProduct_IdAndColor_CodeAndSize_Id(
                request.getProductId(), request.getColorCode(), request.getSizeId())) {
            throw new ResourceAlreadyExistsException(
                    "ProductVariant",
                    "productId + colorCode + sizeId",
                    request.getProductId() + ", " + request.getColorCode() + ", " + request.getSizeId()
            );
        }

        String id = request.getId() != null && !request.getId().trim().isEmpty()
                ? request.getId().trim()
                : UUID.randomUUID().toString();

        if (productVariantRepository.existsById(id)) {
            throw new ResourceAlreadyExistsException("ProductVariant", "id", id);
        }

        ProductVariant pv = new ProductVariant();
        pv.setId(id);
        pv.setQuantity(request.getQuantity());
        pv.setImg(request.getImg().trim());
        pv.setProduct(product);
        pv.setColor(color);
        pv.setSize(size);

        ProductVariant saved = productVariantRepository.save(pv);
        return ProductVariantMapper.toResponse(saved);
    }

    /**
     * Update an existing product variant
     */
    public ProductVariantResponse update(String id, ProductVariantUpdateRequest request) {
        ProductVariant pv = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));
        Color color = colorRepository.findById(request.getColorCode())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "code", request.getColorCode()));
        Size size = sizeRepository.findById(request.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", request.getSizeId()));

        if (productVariantRepository.existsByProduct_IdAndColor_CodeAndSize_IdAndIdNot(
                request.getProductId(), request.getColorCode(), request.getSizeId(), id)) {
            throw new ResourceAlreadyExistsException(
                    "ProductVariant",
                    "productId + colorCode + sizeId",
                    request.getProductId() + ", " + request.getColorCode() + ", " + request.getSizeId()
            );
        }

        pv.setQuantity(request.getQuantity());
        pv.setImg(request.getImg().trim());
        pv.setProduct(product);
        pv.setColor(color);
        pv.setSize(size);

        ProductVariant saved = productVariantRepository.save(pv);
        return ProductVariantMapper.toResponse(saved);
    }

    /**
     * Delete a product variant by ID
     */
    public void delete(String id) {
        ProductVariant pv = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        if (pv.getCartItems() != null && !pv.getCartItems().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete product variant that is in cart items. Please remove from carts first."
            );
        }
        if (pv.getOrderItems() != null && !pv.getOrderItems().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete product variant that is in order items. Please remove from orders first."
            );
        }

        productVariantRepository.delete(pv);
    }

    /**
     * Get product variant by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductVariantResponse getById(String id) {
        ProductVariant pv = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
        return ProductVariantMapper.toResponse(pv);
    }
}
