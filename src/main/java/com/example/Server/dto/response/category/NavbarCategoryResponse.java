package com.example.Server.dto.response.category;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class NavbarCategoryResponse {
    private Long categoryId;
    private String categoryName;
    private List<NavbarCategoryResponse> children;
}
