package com.example.Server.dto.response.cartItem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private String id;
    private Integer quantity;
    private String cartId;
    private String productVariantId;
}
