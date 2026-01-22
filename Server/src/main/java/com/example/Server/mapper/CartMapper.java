package com.example.Server.mapper;

import com.example.Server.dto.response.cart.CartResponse;
import com.example.Server.entity.Cart;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Cart entity and its DTOs
 */
public class CartMapper {

    /**
     * Convert Cart entity to CartResponse
     */
    public static CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setAccountId(cart.getAccount() != null ? cart.getAccount().getId() : null);

        return response;
    }

    /**
     * Convert list of Cart entities to list of CartResponse
     */
    public static List<CartResponse> toResponses(List<Cart> carts) {
        if (carts == null) {
            return Collections.emptyList();
        }

        return carts.stream()
                .map(CartMapper::toResponse)
                .collect(Collectors.toList());
    }
}
