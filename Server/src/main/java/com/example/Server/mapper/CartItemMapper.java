package com.example.Server.mapper;

import com.example.Server.dto.response.cartItem.CartItemResponse;
import com.example.Server.entity.CartItem;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for CartItem entity and its DTOs
 */
public class CartItemMapper {

    /**
     * Convert CartItem entity to CartItemResponse
     */
    public static CartItemResponse toResponse(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setQuantity(cartItem.getQuantity());
        response.setCartId(cartItem.getCart() != null ? cartItem.getCart().getId() : null);
        response.setProductVariantId(cartItem.getProductVariant() != null ? cartItem.getProductVariant().getId() : null);

        return response;
    }

    /**
     * Convert list of CartItem entities to list of CartItemResponse
     */
    public static List<CartItemResponse> toResponses(List<CartItem> cartItems) {
        if (cartItems == null) {
            return Collections.emptyList();
        }

        return cartItems.stream()
                .map(CartItemMapper::toResponse)
                .collect(Collectors.toList());
    }
}
