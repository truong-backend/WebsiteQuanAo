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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryMapper     categoryMapper;
    private final CategoryRepository categoryRepository;
    private final CategoryService    categoryService;

    /**
     * FIXED: @Cacheable đã chuyển vào CategoryService.
     * Controller chỉ gọi service và bọc kết quả vào ResponseEntity.
     * Tránh lỗi "Cannot construct instance of ResponseEntity" từ Redis.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/roots")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getRoots() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getRootCategories()));
    }

    /** POST /api/v1/categories — Admin */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody Category req) {
        req.setCategoryId(null);
        Category saved = categoryRepository.save(req);
        categoryService.evictAll(); // xóa cache sau khi tạo mới
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved));
    }

    /** PUT /api/v1/categories/{id} — Admin */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> update(
            @PathVariable Long id,
            @RequestBody  UpdateCategoryRequest req) {

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
                    .orElseThrow(() -> new BusinessException("Không tìm thấy danh mục cha id=" + req.getParentCategoryId()));
            existing.setParentCategory(parent);
        }

        Category saved = categoryRepository.save(existing);
        categoryService.evictAll(); // xóa cache sau khi cập nhật
        return ResponseEntity.ok(ApiResponse.ok(categoryMapper.toDto(saved)));
    }

    /** DELETE /api/v1/categories/{id} — Admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        categoryService.evictAll(); // xóa cache sau khi xóa
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}