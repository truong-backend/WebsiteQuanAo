package com.example.Server.controller;

import com.example.Server.dto.request.productType.ProductTypeCreateRequest;
import com.example.Server.dto.request.productType.ProductTypeUpdateRequest;
import com.example.Server.dto.response.productType.ProductTypeResponse;
import com.example.Server.services.ProductTypeService;
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
 * REST Controller for ProductType management
 * Base path: /product-types
 */
@RestController
@RequestMapping("/product-types")
public class ProductTypeController {

    private final ProductTypeService productTypeService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "productId",
            "productName"
    );

    public ProductTypeController(ProductTypeService productTypeService) {
        this.productTypeService = productTypeService;
    }

    /**
     * Get paginated product types with filter and search
     * GET /product-types
     */
    @GetMapping
    public ResponseEntity<Page<ProductTypeResponse>> getProductTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "productId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "productId";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(productTypeService.findAll(pageable, search));
    }

    /**
     * Create product type
     * POST /product-types
     */
    @PostMapping
    public ResponseEntity<ProductTypeResponse> createProductType(
            @Valid @RequestBody ProductTypeCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productTypeService.create(request));
    }

    /**
     * Update product type
     * PUT /product-types/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductTypeResponse> updateProductType(
            @PathVariable Long id,
            @Valid @RequestBody ProductTypeUpdateRequest request
    ) {
        return ResponseEntity.ok(productTypeService.update(id, request));
    }

    /**
     * Delete product type
     * DELETE /product-types/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductType(@PathVariable Long id) {
        productTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get product type by id
     * GET /product-types/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductTypeResponse> getProductTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(productTypeService.getById(id));
    }
}
