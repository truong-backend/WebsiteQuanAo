package com.example.fashionstore.dto.cart;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotBlank(message = "Variant ID không được để trống")
    private String variantId;

    @NotNull
    @Min(value = 1, message = "Số lượng tối thiểu là 1")
    @Max(value = 100, message = "Số lượng tối đa là 100")
    private Integer quantity;
}