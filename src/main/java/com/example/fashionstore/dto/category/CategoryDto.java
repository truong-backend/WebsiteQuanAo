package com.example.fashionstore.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    private Long   categoryId;
    private String categoryName;
    private Long   parentCategoryId;

    /** Chỉ populate ở root level, children KHÔNG có children tiếp (tránh circular) */
    private List<CategoryDto> childCategories;
}