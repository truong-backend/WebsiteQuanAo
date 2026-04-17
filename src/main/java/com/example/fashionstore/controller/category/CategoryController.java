package com.example.fashionstore.controller.category;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.category.CategoryDto;
import com.example.fashionstore.dto.category.UpdateCategoryRequest;
import com.example.fashionstore.mapper.category.CategoryMapper;
import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.repository.category.CategoryRepository;
import com.example.fashionstore.service.category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;
    private final CategoryRepository categoryRepository;

    // ── GET ALL ───────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll(
            @RequestParam(defaultValue = "false") boolean includeDeleted) {

        List<CategoryDto> result = includeDeleted
                ? categoryService.getAllCategoriesAdmin()
                : categoryService.getAllCategories();

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ── ROOT CATEGORIES ───────────────────────────────

    @GetMapping("/roots")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getRoots() {
        return ResponseEntity.ok(
                ApiResponse.ok(categoryService.getRootCategories())
        );
    }

    // ── CREATE ────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> create(@RequestBody Category req) {

        req.setCategoryId(null);

        Category saved = categoryRepository.save(req);

        categoryService.evictAll();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(categoryMapper.toDto(saved)));
    }

    // ── UPDATE ────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> update(
            @PathVariable Long id,
            @RequestBody UpdateCategoryRequest req) {

        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy danh mục id=" + id));

        if (req.getParentCategoryId() != null && req.getParentCategoryId().equals(id)) {
            throw new BusinessException("Danh mục không thể là cha của chính nó");
        }

        if (req.getParentCategoryId() != null) {
            boolean isChild = existing.getChildCategories() != null &&
                    existing.getChildCategories().stream()
                            .anyMatch(c -> c.getCategoryId().equals(req.getParentCategoryId()));

            if (isChild) {
                throw new BusinessException("Không thể đặt danh mục con làm cha");
            }
        }

        existing.setCategoryName(req.getCategoryName());

        if (req.getParentCategoryId() == null) {
            existing.setParentCategory(null);
        } else {
            Category parent = categoryRepository.findById(req.getParentCategoryId())
                    .orElseThrow(() -> new BusinessException(
                            "Không tìm thấy danh mục cha id=" + req.getParentCategoryId()));

            existing.setParentCategory(parent);
        }

        Category saved = categoryRepository.save(existing);

        categoryService.evictAll();

        return ResponseEntity.ok(ApiResponse.ok(categoryMapper.toDto(saved)));
    }

    // ── SOFT DELETE (👉 đã dùng service) ───────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa danh mục", null));
    }

    // ── RESTORE (👉 dùng service) ──────────────────────

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> restore(@PathVariable Long id) {
        CategoryDto dto = categoryService.restore(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã khôi phục", dto));
    }

    // ── HARD DELETE (👉 dùng service) ──────────────────

    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable Long id) {
        categoryService.hardDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa vĩnh viễn", null));
    }
}