package com.example.Server.dto.request.product;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductCreateRequest {
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull @DecimalMin(value = "0")
    private Double price;

    @NotBlank(message = "Path is required")
    private String path;

    @NotBlank(message = "Image URL is required")
    private String img;

    private String hoverImg;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
