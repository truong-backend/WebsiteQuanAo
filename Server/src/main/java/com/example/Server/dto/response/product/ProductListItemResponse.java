package com.example.Server.dto.response.product;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductListItemResponse {
    private String id;
    private String name;
    private Double price;
    private String img;
    private String description;
    private Integer categoryId;
    private String categoryName;
}
