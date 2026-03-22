package com.example.Server.dto.response.cartitem;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemResponse {
    private String id;
    private Integer quantity;
    private String cartId;
    private String productVariantId;
}
