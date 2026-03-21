package com.example.Server.dto.request.cartitem;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemCreateRequest {
    private String id;

    @NotNull @Min(value = 1)
    private Integer quantity;

    @NotNull(message = "Cart ID is required")
    private String cartId;

    @NotNull(message = "Product variant ID is required")
    private String productVariantId;
}
