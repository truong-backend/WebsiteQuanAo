package com.example.Server.mapper;

import com.example.Server.dto.response.cartitem.CartItemResponse;
import com.example.Server.entity.CartItem;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CartItemMapper {
    public static CartItemResponse toResponse(CartItem item) {
        if (item == null) return null;
        CartItemResponse r = new CartItemResponse();
        r.setId(item.getId());
        r.setQuantity(item.getQuantity());
        r.setCartId(item.getCart() != null ? item.getCart().getId() : null);
        r.setProductVariantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null);
        return r;
    }
    public static List<CartItemResponse> toResponses(List<CartItem> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(CartItemMapper::toResponse).collect(Collectors.toList());
    }
}
