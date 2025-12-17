package com.example.Server.dto.category.create;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponse {
    private Long categoryId;
    private String categoryName;
    private Long parentCategoryId;
    private List<CategoryResponse> childCategories;
}