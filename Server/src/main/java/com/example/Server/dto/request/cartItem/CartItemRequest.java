package com.example.Server.dto.request.cartItem;

import com.example.Server.entity.Cart;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    private String id;
    private Integer quantity;
    private Cart cart;
}
