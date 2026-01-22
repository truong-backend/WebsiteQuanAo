package com.example.Server.controller;

import com.example.Server.dto.request.productVariant.ProductVariantCreateRequest;
import com.example.Server.dto.request.productVariant.ProductVariantUpdateRequest;
import com.example.Server.dto.response.productVariant.ProductVariantResponse;
import com.example.Server.services.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * REST Controller for ProductVariant management
 * Base path: /product-variants
 */
@RestController
@RequestMapping("/product-variants")
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "quantity",
            "img"
    );

    public ProductVariantController(ProductVariantService productVariantService) {
        this.productVariantService = productVariantService;
    }

    /**
     * Get paginated product variants with filter and search
     * GET /product-variants
     */
    @GetMapping
    public ResponseEntity<Page<ProductVariantResponse>> getProductVariants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(productVariantService.findAll(pageable, search));
    }

    /**
     * Create product variant
     * POST /product-variants
     */
    @PostMapping
    public ResponseEntity<ProductVariantResponse> createProductVariant(
            @Valid @RequestBody ProductVariantCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productVariantService.create(request));
    }

    /**
     * Update product variant
     * PUT /product-variants/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> updateProductVariant(
            @PathVariable String id,
            @Valid @RequestBody ProductVariantUpdateRequest request
    ) {
        return ResponseEntity.ok(productVariantService.update(id, request));
    }

    /**
     * Delete product variant
     * DELETE /product-variants/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductVariant(@PathVariable String id) {
        productVariantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get product variant by id
     * GET /product-variants/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getProductVariantById(@PathVariable String id) {
        return ResponseEntity.ok(productVariantService.getById(id));
    }
}
