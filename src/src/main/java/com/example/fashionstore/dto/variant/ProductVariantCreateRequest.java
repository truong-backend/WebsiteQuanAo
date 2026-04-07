package com.example.fashionstore.dto.variant;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductVariantCreateRequest {
    @NotBlank
    private String productId;

    @NotBlank
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "SKU chỉ chứa chữ HOA, số và dấu gạch dưới")
    @Size(max = 50)
    private String sku;

    @NotBlank
    private String colorCode;

    @NotBlank
    private String colorName;

    @NotBlank
    private String sizeCode;

    @NotNull
    @Min(0)
    private Integer quantity;

    private String imageUrl;
}