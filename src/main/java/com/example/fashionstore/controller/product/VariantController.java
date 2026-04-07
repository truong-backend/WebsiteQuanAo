package com.example.fashionstore.controller.product;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.variant.ProductVariantCreateRequest;
import com.example.fashionstore.dto.variant.ProductVariantUpdateRequest;
import com.example.fashionstore.dto.variant.VariantDto;
import com.example.fashionstore.service.variant.VariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products/{productId}/variants")
@RequiredArgsConstructor
public class VariantController {

    private final VariantService variantService;

    /**
     * GET /api/v1/products/{productId}/variants
     * Public — lấy tất cả variant của sản phẩm
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VariantDto>>> getVariants(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(variantService.findByProductId(productId)));
    }

    /**
     * GET /api/v1/products/{productId}/variants/{variantId}
     * Public — chi tiết 1 variant
     */
    @GetMapping("/{variantId}")
    public ResponseEntity<ApiResponse<VariantDto>> getById(
            @PathVariable String productId,
            @PathVariable String variantId) {
        return ResponseEntity.ok(ApiResponse.ok(variantService.getById(variantId)));
    }

    /**
     * POST /api/v1/products/{productId}/variants
     * Admin — tạo variant mới (colorId + sizeId phải tồn tại và active)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VariantDto>> create(
            @PathVariable String productId,
            @Valid @RequestBody ProductVariantCreateRequest req) {
        req.setProductId(productId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(variantService.create(productId, req)));
    }

    /**
     * PUT /api/v1/products/{productId}/variants/{variantId}
     * Admin — cập nhật color, size, quantity, imageUrl
     */
    @PutMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VariantDto>> update(
            @PathVariable String productId,
            @PathVariable String variantId,
            @Valid @RequestBody ProductVariantUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Cập nhật variant thành công",
                variantService.update(productId, variantId, req)
        ));
    }

    /**
     * DELETE /api/v1/products/{productId}/variants/{variantId}
     * Admin — xoá variant (chỉ xoá được nếu không có order đang dùng)
     */
    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String productId,
            @PathVariable String variantId) {
        variantService.delete(productId, variantId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá variant", null));
    }
}