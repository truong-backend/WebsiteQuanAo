package com.example.fashionstore.controller.product;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.variant.ProductVariantCreateRequest;
import com.example.fashionstore.module.product.Product;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.product.ProductRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products/{productId}/variants")
@RequiredArgsConstructor
public class VariantController {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository        productRepository;

    /** GET /api/v1/products/{productId}/variants */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductVariant>>> getVariants(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(variantRepository.findByProductId(productId)));
    }

    /** POST /api/v1/products/{productId}/variants — Admin */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductVariant>> create(
            @PathVariable String productId,
            @Valid @RequestBody ProductVariantCreateRequest req) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (variantRepository.existsBySku(req.getSku()))
            throw new BusinessException("SKU '" + req.getSku() + "' đã tồn tại");

        ProductVariant variant = ProductVariant.builder()
                .id(UUID.randomUUID().toString())
                .sku(req.getSku())
                .product(product)
                .colorCode(req.getColorCode())
                .colorName(req.getColorName())
                .sizeCode(req.getSizeCode())
                .quantity(req.getQuantity())
                .imageUrl(req.getImageUrl())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(variantRepository.save(variant)));
    }

    /** PUT /api/v1/products/{productId}/variants/{variantId} — Admin */
    @PutMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductVariant>> update(
            @PathVariable String variantId,
            @Valid @RequestBody ProductVariantCreateRequest req) {

        ProductVariant v = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", variantId));

        v.setColorCode(req.getColorCode());
        v.setColorName(req.getColorName());
        v.setSizeCode(req.getSizeCode());
        v.setQuantity(req.getQuantity());
        v.setImageUrl(req.getImageUrl());

        return ResponseEntity.ok(ApiResponse.ok(variantRepository.save(v)));
    }

    /** DELETE /api/v1/products/{productId}/variants/{variantId} — Admin */
    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String variantId) {
        variantRepository.deleteById(variantId);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}