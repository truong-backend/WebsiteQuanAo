package com.example.fashionstore.dto.category;

import lombok.Data;

@Data
public class CreateCategoryRequest {

    /** Tên danh mục mới */
    private String categoryName;

    /** null = danh mục gốc, có giá trị = danh mục con */
    private Long parentCategoryId;
}