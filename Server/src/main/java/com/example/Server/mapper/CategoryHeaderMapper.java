package com.example.Server.mapper;

import com.example.Server.dto.response.category.CategoryHeaderResponse;
import com.example.Server.entity.Category;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** Mapper cho cây danh mục (đệ quy). */
public class CategoryHeaderMapper {
    public static CategoryHeaderResponse toResponse(Category c) {
        if (c == null) return null;
        CategoryHeaderResponse r = new CategoryHeaderResponse();
        r.setCategoryId(c.getCategoryId());
        r.setCategoryName(c.getCategoryName());
        r.setChildren(c.getChildCategories() != null && !c.getChildCategories().isEmpty()
                ? c.getChildCategories().stream().map(CategoryHeaderMapper::toResponse).collect(Collectors.toList())
                : Collections.emptyList());
        return r;
    }
    public static List<CategoryHeaderResponse> toResponses(List<Category> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(CategoryHeaderMapper::toResponse).collect(Collectors.toList());
    }
}
