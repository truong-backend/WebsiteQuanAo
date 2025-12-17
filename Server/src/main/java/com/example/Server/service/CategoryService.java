package com.example.Server.service;

import com.example.Server.dto.category.create.CategoryCreateRequest;
import com.example.Server.dto.category.create.CategoryResponse;
import com.example.Server.entity.Category;
import com.example.Server.exception.NotFoundException;
import com.example.Server.mapper.CategoryMapper;
import com.example.Server.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category entity = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(entity);
    }

    public CategoryResponse createCategory(CategoryCreateRequest request) {
        Category entity = categoryMapper.toEntity(request);

        if (request.getParentCategoryId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found with id: " + request.getParentCategoryId()));
            entity.setParentCategory(parentCategory);
        }

        Category savedEntity = categoryRepository.save(entity);
        return categoryMapper.toResponse(savedEntity);
    }

    public CategoryResponse updateCategory(Long id, CategoryCreateRequest request) {
        Category entity = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));

        categoryMapper.updateEntity(entity, request);

        if (request.getParentCategoryId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found with id: " + request.getParentCategoryId()));
            entity.setParentCategory(parentCategory);
        }

        Category updatedEntity = categoryRepository.save(entity);
        return categoryMapper.toResponse(updatedEntity);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}