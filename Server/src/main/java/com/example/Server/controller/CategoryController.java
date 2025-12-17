package com.example.Server.controller;

import com.example.Server.dto.category.create.CategoryCreateRequest;
import com.example.Server.dto.category.create.CategoryResponse;
import com.example.Server.mapper.CategoryMapper;
import com.example.Server.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/danhmuc")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper danhmucMapper;

    @GetMapping
    public List<CategoryResponse> getAll() {
        return categoryService.getAllCategories().stream()
                .map(danhmucMapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CategoryResponse getById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    public CategoryResponse create(@RequestBody CategoryCreateRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id,
                                   @RequestBody CategoryCreateRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return "Xóa thành công";
    }
}
