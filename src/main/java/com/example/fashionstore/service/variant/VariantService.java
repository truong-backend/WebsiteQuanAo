package com.example.fashionstore.service.variant;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.variant.ProductVariantCreateRequest;
import com.example.fashionstore.dto.variant.ProductVariantUpdateRequest;
import com.example.fashionstore.dto.variant.VariantDto;
import com.example.fashionstore.module.color.Color;
import com.example.fashionstore.module.product.Product;
import com.example.fashionstore.module.size.Size;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.color.ColorRepository;
import com.example.fashionstore.repository.product.ProductRepository;
import com.example.fashionstore.repository.size.SizeRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository        productRepository;
    private final ColorRepository          colorRepository;
    private final SizeRepository           sizeRepository;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VariantDto> findByProductId(String productId) {
        // Verify product exists
        if (!productRepository.existsById(productId))
            throw new ResourceNotFoundException("Product", "id", productId);
        return variantRepository.findByProductId(productId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public VariantDto getById(String variantId) {
        return toDto(findOrThrow(variantId));
    }

    // ── Write ───────────────────────────────────────────────────────

    public VariantDto create(String productId, ProductVariantCreateRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Color color = colorRepository.findById(req.getColorId())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", req.getColorId()));
        if (!color.isActive())
            throw new BusinessException("Màu '" + color.getName() + "' đang bị vô hiệu hoá");

        Size size = sizeRepository.findById(req.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", req.getSizeId()));
        if (!size.isActive())
            throw new BusinessException("Size '" + size.getCode() + "' đang bị vô hiệu hoá");

        if (variantRepository.existsBySku(req.getSku()))
            throw new BusinessException("SKU '" + req.getSku() + "' đã tồn tại");

        // Kiểm tra trùng color+size trên cùng product
        variantRepository.findByProductAndColorAndSize(productId, color.getId(), size.getId())
                .ifPresent(v -> { throw new BusinessException(
                        "Variant với màu '" + color.getName() + "' và size '" + size.getCode() + "' đã tồn tại");
                });

        ProductVariant variant = ProductVariant.builder()
                .id(UUID.randomUUID().toString())
                .sku(req.getSku().toUpperCase().trim())
                .product(product)
                .color(color)
                .size(size)
                .quantity(req.getQuantity())
                .imageUrl(req.getImageUrl())
                .build();

        return toDto(variantRepository.save(variant));
    }

    public VariantDto update(String productId, String variantId, ProductVariantUpdateRequest req) {
        ProductVariant variant = findOrThrow(variantId);

        // Verify variant belongs to this product
        if (!variant.getProduct().getId().equals(productId))
            throw new BusinessException("Variant không thuộc sản phẩm này");

        Color color = colorRepository.findById(req.getColorId())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", req.getColorId()));
        if (!color.isActive())
            throw new BusinessException("Màu '" + color.getName() + "' đang bị vô hiệu hoá");

        Size size = sizeRepository.findById(req.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", req.getSizeId()));
        if (!size.isActive())
            throw new BusinessException("Size '" + size.getCode() + "' đang bị vô hiệu hoá");

        // Kiểm tra conflict color+size (trừ chính nó)
        variantRepository.findByProductAndColorAndSize(productId, color.getId(), size.getId())
                .ifPresent(v -> {
                    if (!v.getId().equals(variantId))
                        throw new BusinessException(
                                "Variant với màu '" + color.getName() + "' và size '" + size.getCode() + "' đã tồn tại");
                });

        variant.setColor(color);
        variant.setSize(size);
        variant.setQuantity(req.getQuantity());
        variant.setImageUrl(req.getImageUrl());

        return toDto(variantRepository.save(variant));
    }

    public void delete(String productId, String variantId) {
        ProductVariant variant = findOrThrow(variantId);
        if (!variant.getProduct().getId().equals(productId))
            throw new BusinessException("Variant không thuộc sản phẩm này");
        variantRepository.delete(variant);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private ProductVariant findOrThrow(String id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
    }

    public VariantDto toDto(ProductVariant v) {
        return VariantDto.builder()
                .id(v.getId())
                .sku(v.getSku())
                .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                .productName(v.getProduct() != null ? v.getProduct().getName() : null)
                .colorId(v.getColor() != null ? v.getColor().getId() : null)
                .colorCode(v.getColor() != null ? v.getColor().getCode() : null)
                .colorName(v.getColor() != null ? v.getColor().getName() : null)
                .sizeId(v.getSize() != null ? v.getSize().getId() : null)
                .sizeCode(v.getSize() != null ? v.getSize().getCode() : null)
                .sizeName(v.getSize() != null ? v.getSize().getName() : null)
                .quantity(v.getQuantity())
                .inStock(v.getQuantity() > 0)
                .imageUrl(v.getImageUrl())
                .build();
    }
}