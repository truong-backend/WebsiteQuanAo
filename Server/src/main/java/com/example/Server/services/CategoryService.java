package com.example.Server.services;

import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.dto.request.color.ColorRequest;
import com.example.Server.entity.Category;
import com.example.Server.entity.Color;
import com.example.Server.repository.CategoryRepository;
import com.example.Server.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Boolean Create(CategoryRequest categoryRequest) {
        if (!categoryRepository.existsById(categoryRequest.getCategoryId())) {
            Category categoryEntity = new Category();
            categoryEntity.setCategoryName(categoryRequest.getCategoryName());
//            categoryEntity.setParentCategory(categoryRequest.getParentCategory());
            categoryRepository.save(categoryEntity);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( CategoryRequest categoryRequest) {
        if (categoryRepository.existsById(categoryRequest.getCategoryId())) {
            Optional<Category> category = categoryRepository.findById(categoryRequest.getCategoryId());
            category.get().setCategoryName(categoryRequest.getCategoryName());
//            category.get().setParentCategory(categoryRequest.getParentCategory());
            categoryRepository.save(category.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }

}
