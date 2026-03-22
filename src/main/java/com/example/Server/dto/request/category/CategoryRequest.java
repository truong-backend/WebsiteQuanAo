package com.example.Server.dto.request.category;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CategoryRequest {
    private String categoryName;
    private Long parentCategoryId;
}
