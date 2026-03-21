package com.example.Server.controller;

import com.example.Server.dto.request.productvariant.*;
import com.example.Server.dto.response.productvariant.ProductVariantResponse;
import com.example.Server.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

/** Base path: /product-variants */
@RestController @RequestMapping("/product-variants")
public class ProductVariantController {
    private final ProductVariantService productVariantService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "quantity");
    public ProductVariantController(ProductVariantService productVariantService) { this.productVariantService = productVariantService; }

    @GetMapping
    public ResponseEntity<Page<ProductVariantResponse>> getProductVariants(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(productVariantService.findAll(PageRequest.of(page, size, sort), search));
    }

    @PostMapping
    public ResponseEntity<ProductVariantResponse> createProductVariant(@Valid @RequestBody ProductVariantCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productVariantService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> updateProductVariant(@PathVariable String id, @Valid @RequestBody ProductVariantUpdateRequest request) {
        return ResponseEntity.ok(productVariantService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductVariant(@PathVariable String id) {
        productVariantService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getProductVariantById(@PathVariable String id) { return ResponseEntity.ok(productVariantService.getById(id)); }
}
