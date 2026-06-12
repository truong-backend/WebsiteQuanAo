package com.example.fashionstore.dto.cart;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateCartRequest {
    @NotNull
    @Min(value = 0, message = "Quantity must be >= 0. Use 0 to remove item.")
    private Integer quantity;
}