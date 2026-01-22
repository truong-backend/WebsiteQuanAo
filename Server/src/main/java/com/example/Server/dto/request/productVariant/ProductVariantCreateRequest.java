package com.example.Server.dto.request.productVariant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantCreateRequest {

    private String id;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be >= 0")
    private Integer quantity;

    @NotBlank(message = "Image URL is required")
    private String img;

    @NotNull(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Color code is required")
    private String colorCode;

    @NotNull(message = "Size ID is required")
    private String sizeId;
}
