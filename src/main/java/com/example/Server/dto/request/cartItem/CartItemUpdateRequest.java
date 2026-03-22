package com.example.Server.dto.request.cartitem;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemUpdateRequest {
    @NotNull @Min(value = 1)
    private Integer quantity;
}
