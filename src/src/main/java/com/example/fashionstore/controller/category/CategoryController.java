package com.example.fashionstore.controller.category;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.repository.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    /** GET /api/v1/categories — danh sách categories có children */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryRepository.findAllWithChildren()));
    }

    /** GET /api/v1/categories/roots — chỉ root categories */
    @GetMapping("/roots")
    public ResponseEntity<ApiResponse<List<Category>>> getRoots() {
        return ResponseEntity.ok(ApiResponse.ok(categoryRepository.findByParentCategoryIsNull()));
    }

    /** POST /api/v1/categories — Admin */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody Category req) {
        req.setCategoryId(null); // auto-generate
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(categoryRepository.save(req)));
    }

    /** PUT /api/v1/categories/{id} — Admin */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> update(
            @PathVariable Long id,
            @RequestBody Category req) {
        req.setCategoryId(id);
        return ResponseEntity.ok(ApiResponse.ok(categoryRepository.save(req)));
    }

    /** DELETE /api/v1/categories/{id} — Admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}