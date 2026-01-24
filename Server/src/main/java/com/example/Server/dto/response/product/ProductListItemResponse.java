package com.example.Server.dto.response.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for product listing page
 * Contains minimal info needed for product cards
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductListItemResponse {
    private String id;
    private String name;
    private Double price;
    private String img;
    private Integer categoryId;
    private String categoryName;
    private String description;
}