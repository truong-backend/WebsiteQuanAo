package com.example.Server.dto.request.cart;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotBlank(message = "productVariantId is required")
    private String productVariantId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be >= 1")
    private Integer quantity;
}
