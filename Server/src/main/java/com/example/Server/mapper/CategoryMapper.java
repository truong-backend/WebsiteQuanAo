package com.example.Server.mapper;

import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.dto.response.category.CategoryHeaderResponse;
import com.example.Server.dto.response.category.CategoryOptionResponse;
import com.example.Server.dto.response.category.CategoryResponse;
import com.example.Server.entity.Category;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Category entity and its DTOs
 */
public class CategoryMapper {

    /**
     * Convert Category entity to CategoryHeaderResponse (with children)
     */
    public static CategoryHeaderResponse toHeaderResponse(Category category) {
        if (category == null) {
            return null;
        }

        CategoryHeaderResponse response = new CategoryHeaderResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());

        if (category.getChildCategories() != null && !category.getChildCategories().isEmpty()) {
            response.setChildren(
                    category.getChildCategories().stream()
                            .map(CategoryMapper::toHeaderResponse)
                            .collect(Collectors.toList())
            );
        } else {
            response.setChildren(Collections.emptyList());
        }

        return response;
    }

    /**
     * Convert list of Category entities to list of CategoryHeaderResponse
     */
    public static List<CategoryHeaderResponse> toHeaderResponses(List<Category> categories) {
        if (categories == null) {
            return Collections.emptyList();
        }

        return categories.stream()
                .map(CategoryMapper::toHeaderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Category entity to CategoryResponse (with parent info)
     */
    public static CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }

        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());

        if (category.getParentCategory() != null) {
            response.setParentCategoryId(category.getParentCategory().getCategoryId());
            response.setParentCategoryName(category.getParentCategory().getCategoryName());
        }

        return response;
    }

    /**
     * Convert Category entity to CategoryRequest
     */
    public static CategoryRequest toRequest(Category category) {
        if (category == null) {
            return null;
        }

        CategoryRequest request = new CategoryRequest();
        request.setCategoryName(category.getCategoryName());

        if (category.getParentCategory() != null) {
            request.setParentCategoryId(category.getParentCategory().getCategoryId());
        }

        return request;
    }

    /**
     * Convert Category entity to CategoryOptionResponse (simple option)
     */
    public static CategoryOptionResponse toOptionResponse(Category category) {
        if (category == null) {
            return null;
        }

        CategoryOptionResponse response = new CategoryOptionResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());

        return response;
    }

    /**
     * Convert list of Category entities to list of CategoryOptionResponse
     */
    public static List<CategoryOptionResponse> toOptionResponses(List<Category> categories) {
        if (categories == null) {
            return Collections.emptyList();
        }

        return categories.stream()
                .map(CategoryMapper::toOptionResponse)
                .collect(Collectors.toList());
    }
}