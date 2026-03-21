package com.example.Server.mapper;

import com.example.Server.dto.response.category.CategoryResponse;
import com.example.Server.entity.Category;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {
    public static CategoryResponse toResponse(Category c) {
        if (c == null) return null;
        CategoryResponse r = new CategoryResponse();
        r.setCategoryId(c.getCategoryId());
        r.setCategoryName(c.getCategoryName());
        if (c.getParentCategory() != null) {
            r.setParentCategoryId(c.getParentCategory().getCategoryId());
            r.setParentCategoryName(c.getParentCategory().getCategoryName());
        }
        return r;
    }
    public static List<CategoryResponse> toResponses(List<Category> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(CategoryMapper::toResponse).collect(Collectors.toList());
    }
}
