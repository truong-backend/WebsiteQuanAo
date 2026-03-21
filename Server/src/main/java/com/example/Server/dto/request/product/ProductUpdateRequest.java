package com.example.Server.dto.request.product;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductUpdateRequest {
    @NotBlank private String name;
    @NotBlank private String description;
    @NotNull @DecimalMin("0") private Double price;
    @NotBlank private String path;
    @NotBlank private String img;
    private String hoverImg;
    @NotNull(message = "Product type ID is required") private Long productTypeId;
}
