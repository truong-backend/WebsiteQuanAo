package com.example.Server.mapper;

import com.example.Server.dto.response.category.CategoryOptionResponse;
import com.example.Server.entity.Category;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryOptionMapper {
    public static CategoryOptionResponse toResponse(Category c) {
        if (c == null) return null;
        CategoryOptionResponse r = new CategoryOptionResponse();
        r.setCategoryId(c.getCategoryId());
        r.setCategoryName(c.getCategoryName());
        return r;
    }
    public static List<CategoryOptionResponse> toResponses(List<Category> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(CategoryOptionMapper::toResponse).collect(Collectors.toList());
    }
}
