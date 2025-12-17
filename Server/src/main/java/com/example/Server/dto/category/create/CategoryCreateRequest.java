package com.example.Server.dto.category.create;

import lombok.Data;

@Data
public class CategoryCreateRequest {
    private String categoryName;
    private Long parentCategoryId;
}