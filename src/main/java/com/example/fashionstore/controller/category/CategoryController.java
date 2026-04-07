package com.example.fashionstore.controller.category;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.category.CategoryDto;
import com.example.fashionstore.mapper.category.CategoryMapper;
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

    private final CategoryMapper categoryMapper;
    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll() {
        List<Category> cats = categoryRepository.findAllWithChildren();
        return ResponseEntity.ok(ApiResponse.ok(categoryMapper.toDtoList(cats)));
    }

    @GetMapping("/roots")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getRoots() {
        List<Category> roots = categoryRepository.findByParentCategoryIsNull();
        return ResponseEntity.ok(ApiResponse.ok(categoryMapper.toDtoList(roots)));
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