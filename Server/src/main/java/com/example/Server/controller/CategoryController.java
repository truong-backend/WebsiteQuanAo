package com.example.Server.controller;


import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.entity.Category;
import com.example.Server.entity.Category;
import com.example.Server.services.CategoryService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Category")
@RestController
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/all")
    public List<Category> getAllCategorys() {
        return categoryService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveCategory( CategoryRequest categoryRequest) {
        return categoryService.Create(categoryRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateCategory( CategoryRequest categoryRequest) {
        return categoryService.Update(categoryRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteCategory(Long id) {
        return categoryService.Delete(id);
    }
}
