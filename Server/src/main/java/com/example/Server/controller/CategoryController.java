package com.example.Server.controller;

import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.dto.response.category.*;
import com.example.Server.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

/** Base path: /categories */
@RestController @RequestMapping("/categories")
public class CategoryController {
    private final CategoryService categoryService;
    private static final Set<String> ALLOWED_SORT = Set.of("categoryId", "categoryName");
    public CategoryController(CategoryService categoryService) { this.categoryService = categoryService; }

    @GetMapping("/options")
    public ResponseEntity<List<CategoryOptionResponse>> getCategoryOptions() { return ResponseEntity.ok(categoryService.getAllCategoryOptions()); }

    @GetMapping("/options/root")
    public ResponseEntity<List<CategoryOptionResponse>> getRootCategoryOptions() { return ResponseEntity.ok(categoryService.getRootCategoryOptions()); }

    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getCategories(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "categoryId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir, @RequestParam(required = false) Long parentId) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "categoryId";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(categoryService.findAll(PageRequest.of(page, size, sort), search, parentId));
    }

    @PostMapping
    public ResponseEntity<CategoryHeaderResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryHeaderResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/tree")
    public ResponseEntity<List<CategoryHeaderResponse>> getCategoryTree() { return ResponseEntity.ok(categoryService.getRootCategories()); }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) { return ResponseEntity.ok(categoryService.getById(id)); }

    @GetMapping("/navbar")
    public ResponseEntity<List<NavbarCategoryResponse>> getNavbarCategories() { return ResponseEntity.ok(categoryService.getNavbarCategories()); }
}
