package com.example.Server.dto.response.category;

import lombok.Data;

@Data
public class CategoryResponse {
    private Long categoryId;
    private String categoryName;
    private Long parentCategoryId;
    private String parentCategoryName;
}
