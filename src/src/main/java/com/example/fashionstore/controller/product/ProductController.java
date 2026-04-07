package com.example.fashionstore.controller.product;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.product.*;
import com.example.fashionstore.service.product.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    private static final java.util.Set<String> SORTABLE = java.util.Set.of(
            "id", "name", "basePrice", "createdAt"
    );

    /** GET /api/v1/products
     *  Hỗ trợ: search, categoryId, minPrice, maxPrice, colorCode, sizeCode, sortBy, sortDir */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductListDto>>> getProducts(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "12") int    size,
            @RequestParam(required = false)    String search,
            @RequestParam(required = false)    Long   categoryId,
            @RequestParam(required = false)    java.math.BigDecimal minPrice,
            @RequestParam(required = false)    java.math.BigDecimal maxPrice,
            @RequestParam(required = false)    String colorCode,
            @RequestParam(required = false)    String sizeCode,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc")      String sortDir
    ) {
        if (!SORTABLE.contains(sortBy)) sortBy = "createdAt";
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        ProductFilterDto filter = ProductFilterDto.builder()
                .search(search).categoryId(categoryId)
                .minPrice(minPrice).maxPrice(maxPrice)
                .colorCode(colorCode).sizeCode(sizeCode)
                .build();
        Page<ProductListDto> result = productService.findAll(PageRequest.of(page, size, sort), filter);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /** GET /api/v1/products/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getDetailById(id)));
    }

    /** GET /api/v1/products/slug/{slug} */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getDetailBySlug(slug)));
    }

    /** POST /api/v1/products — Admin only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDetailDto>> create(
            @Valid @RequestBody ProductCreateRequest req) {
        ProductDetailDto created = productService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(created));
    }

    /** PUT /api/v1/products/{id} — Admin only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDetailDto>> update(
            @PathVariable String id,
            @Valid @RequestBody ProductUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", productService.update(id, req)));
    }

    /** DELETE /api/v1/products/{id} — Admin only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}