package com.example.Server.controller;

import com.example.Server.dto.request.product.*;
import com.example.Server.dto.response.product.*;
import com.example.Server.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

/** Base path: /products */
@RestController @RequestMapping("/products")
public class ProductController {
    private final ProductService productService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "name", "price", "path");
    public ProductController(ProductService productService) { this.productService = productService; }

    @GetMapping("/options")
    public ResponseEntity<List<ProductOptionResponse>> getProductOptions() { return ResponseEntity.ok(productService.getAllProductOptions()); }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(productService.findAll(PageRequest.of(page, size, sort), search));
    }

    @GetMapping("/listing")
    public ResponseEntity<Page<ProductListItemResponse>> getProductsForListing(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search, @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "desc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(productService.findAllWithFilters(PageRequest.of(page, size, sort), search, categoryId, minPrice, maxPrice));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable String id, @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getById(@PathVariable String id) { return ResponseEntity.ok(productService.getDetailById(id)); }

    @GetMapping("/path/{path}")
    public ResponseEntity<ProductDetailResponse> getByPath(@PathVariable String path) { return ResponseEntity.ok(productService.getDetailByPath(path)); }
}
