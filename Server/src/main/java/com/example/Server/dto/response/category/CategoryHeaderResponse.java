package com.example.Server.dto.response.category;

import lombok.Data;
import java.util.List;

@Data
public class CategoryHeaderResponse {
    private Long categoryId;
    private String categoryName;
    private List<CategoryHeaderResponse> children;
}
