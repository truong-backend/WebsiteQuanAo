package com.example.Server.dto.request.category;

import com.example.Server.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    private Long categoryId;
    private String categoryName;
//    private Category parentCategory;
}
