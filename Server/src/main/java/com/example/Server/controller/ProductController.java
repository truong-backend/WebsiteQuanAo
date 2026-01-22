package com.example.Server.controller;

import com.example.Server.dto.request.product.ProductCreateRequest;
import com.example.Server.dto.request.product.ProductUpdateRequest;
import com.example.Server.dto.response.product.ProductResponse;
import com.example.Server.services.ProductService;
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
 * REST Controller for Product management
 * Base path: /products
 */
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "name",
            "price",
            "path",
            "img"
    );

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Get paginated products with filter and search
     * GET /products
     */
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
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

        return ResponseEntity.ok(productService.findAll(pageable, search));
    }

    /**
     * Create product
     * POST /products
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productService.create(request));
    }

    /**
     * Update product
     * PUT /products/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    /**
     * Delete product
     * DELETE /products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get product by id
     * GET /products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getById(id));
    }
}
