package com.example.Server.mapper;

import com.example.Server.dto.category.create.CategoryCreateRequest;
import com.example.Server.dto.category.create.CategoryResponse;
import com.example.Server.entity.Category;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryCreateRequest request) {
        Category entity = new Category();
        entity.setCategoryName(request.getCategoryName());
        return entity;
    }

    public CategoryResponse toResponse(Category entity) {
        CategoryResponse response = new CategoryResponse();

        response.setCategoryId(entity.getCategoryId());
        response.setCategoryName(entity.getCategoryName());

        response.setParentCategoryId(
                entity.getParentCategory() == null ? null : entity.getParentCategory().getCategoryId()
        );

        if (entity.getChildCategories() != null) {
            response.setChildCategories(
                    entity.getChildCategories().stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList())
            );
        }

        return response;
    }

    public void updateEntity(Category entity, CategoryCreateRequest request) {
        entity.setCategoryName(request.getCategoryName());
    }
}