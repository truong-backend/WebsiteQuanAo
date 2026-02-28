package com.example.Server.controller;

import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.dto.response.category.CategoryHeaderResponse;
import com.example.Server.dto.response.category.CategoryOptionResponse;
import com.example.Server.dto.response.category.CategoryResponse;
import com.example.Server.dto.response.category.NavbarCategoryResponse;
import com.example.Server.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "categoryId",
            "categoryName"
    );

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Get all categories as select options
     * GET /categories/options
     */
    @GetMapping("/options")
    public ResponseEntity<List<CategoryOptionResponse>> getCategoryOptions() {
        return ResponseEntity.ok(categoryService.getAllCategoryOptions());
    }

    /**
     * Get root category options
     * GET /categories/options/root
     */
    @GetMapping("/options/root")
    public ResponseEntity<List<CategoryOptionResponse>> getRootCategoryOptions() {
        return ResponseEntity.ok(categoryService.getRootCategoryOptions());
    }

    /**
     * Get paginated categories with filter and search
     * GET /categories
     */
    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "categoryId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Long parentId
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "categoryId";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                categoryService.findAll(pageable, search, parentId)
        );
    }

    /**
     * Create category
     * POST /categories
     */
    @PostMapping
    public ResponseEntity<CategoryHeaderResponse> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(categoryService.create(request));
    }

    /**
     * Update category
     * PUT /categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryHeaderResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(
                categoryService.update(id, request)
        );
    }

    /**
     * Delete category
     * DELETE /categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get category tree
     * GET /categories/tree
     */
    @GetMapping("/tree")
    public ResponseEntity<List<CategoryHeaderResponse>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getRootCategories());
    }

    /**
     * Get category by id
     * GET /categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                categoryService.getById(id)
        );
    }

    /**
     * GET /categories/navbar
     * Fetch 1 lần duy nhất cho Navbar:
     * Trả về danh sách root categories, mỗi root có list children (1 level)
     * Public endpoint — không cần đăng nhập
     */
    @GetMapping("/navbar")
    public ResponseEntity<List<NavbarCategoryResponse>> getNavbarCategories() {
        return ResponseEntity.ok(categoryService.getNavbarCategories());
    }
}