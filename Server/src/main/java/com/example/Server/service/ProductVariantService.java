package com.example.Server.service;

import com.example.Server.dto.request.productvariant.*;
import com.example.Server.dto.response.productvariant.ProductVariantResponse;
import com.example.Server.entity.*;
import com.example.Server.exception.*;
import com.example.Server.mapper.ProductVariantMapper;
import com.example.Server.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.UUID;

/** Service quản lý biến thể sản phẩm (màu + size + tồn kho). */
@Service @Transactional
public class ProductVariantService {
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;

    public ProductVariantService(ProductVariantRepository productVariantRepository,
            ProductRepository productRepository, ColorRepository colorRepository, SizeRepository sizeRepository) {
        this.productVariantRepository = productVariantRepository;
        this.productRepository = productRepository;
        this.colorRepository = colorRepository;
        this.sizeRepository = sizeRepository;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ProductVariantResponse> findAll(Pageable pageable, String search) {
        Specification<ProductVariant> spec = (root, q, cb) -> cb.conjunction();
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("id")), kw),
                    cb.like(cb.lower(root.get("product").get("name")), kw)));
        }
        return productVariantRepository.findAll(spec, pageable).map(ProductVariantMapper::toResponse);
    }

    public ProductVariantResponse create(ProductVariantCreateRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));
        Color color = colorRepository.findById(request.getColorCode())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "code", request.getColorCode()));
        Size size = sizeRepository.findById(request.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", request.getSizeId()));
        if (productVariantRepository.existsByProduct_IdAndColor_CodeAndSize_Id(
                request.getProductId(), request.getColorCode(), request.getSizeId()))
            throw new ResourceAlreadyExistsException("ProductVariant", "productId+colorCode+sizeId", request.getProductId());

        ProductVariant pv = new ProductVariant(); pv.setId(UUID.randomUUID().toString());
        pv.setQuantity(request.getQuantity()); pv.setImg(request.getImg().trim());
        pv.setProduct(product); pv.setColor(color); pv.setSize(size);
        return ProductVariantMapper.toResponse(productVariantRepository.save(pv));
    }

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
                request.getProductId(), request.getColorCode(), request.getSizeId(), id))
            throw new ResourceAlreadyExistsException("ProductVariant", "productId+colorCode+sizeId", request.getProductId());

        pv.setQuantity(request.getQuantity()); pv.setImg(request.getImg().trim());
        pv.setProduct(product); pv.setColor(color); pv.setSize(size);
        return ProductVariantMapper.toResponse(productVariantRepository.save(pv));
    }

    public void delete(String id) {
        ProductVariant pv = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
        if (pv.getCartItems()  != null && !pv.getCartItems().isEmpty())
            throw new InvalidOperationException("Cannot delete variant that is in cart items.");
        if (pv.getOrderItems() != null && !pv.getOrderItems().isEmpty())
            throw new InvalidOperationException("Cannot delete variant that is in order items.");
        productVariantRepository.delete(pv);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductVariantResponse getById(String id) {
        return ProductVariantMapper.toResponse(productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id)));
    }
}
