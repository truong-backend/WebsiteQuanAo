package com.example.fashionstore.dto.product;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductUpdateRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 220)
    private String slug;

    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal basePrice;

    private BigDecimal salePrice;

    @NotBlank
    private String mainImage;

    private String hoverImage;

    @NotNull
    private Long categoryId;

    private boolean active = true;
}