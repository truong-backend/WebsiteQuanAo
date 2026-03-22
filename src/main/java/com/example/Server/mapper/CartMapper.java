package com.example.Server.mapper;

import com.example.Server.dto.response.cart.CartResponse;
import com.example.Server.entity.Cart;
import com.example.Server.entity.CartItem;
import com.example.Server.entity.Product;
import com.example.Server.entity.ProductVariant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** Chuyển đổi Cart entity → CartResponse kèm tính tổng tiền. */
public class CartMapper {

    public static CartResponse toResponse(Cart cart) {
        if (cart == null) return null;
        CartResponse res = new CartResponse();
        res.setId(cart.getId());

        List<CartItem> items = cart.getCartItems() != null ? cart.getCartItems() : Collections.emptyList();
        List<CartResponse.CartItemDto> dtos = items.stream()
                .map(CartMapper::toItemDto).collect(Collectors.toList());
        res.setItems(dtos);
        res.setTotalAmount(dtos.stream()
                .mapToDouble(i -> i.getSubtotal() != null ? i.getSubtotal() : 0).sum());
        return res;
    }

    private static CartResponse.CartItemDto toItemDto(CartItem item) {
        CartResponse.CartItemDto dto = new CartResponse.CartItemDto();
        dto.setCartItemId(item.getId());
        dto.setQuantity(item.getQuantity());

        ProductVariant v = item.getProductVariant();
        if (v != null) {
            dto.setProductVariantId(v.getId());
            dto.setImg(v.getImg());
            if (v.getColor() != null) { dto.setColorCode(v.getColor().getCode()); dto.setColorName(v.getColor().getName()); }
            if (v.getSize()  != null) { dto.setSizeId(v.getSize().getId());       dto.setSizeName(v.getSize().getName()); }
            Product p = v.getProduct();
            if (p != null) {
                dto.setProductId(p.getId());
                dto.setProductName(p.getName());
                double price = p.getSalePrice() != null ? p.getSalePrice() : p.getPrice();
                dto.setPrice(price);
                dto.setSubtotal(price * item.getQuantity());
            }
        }
        return dto;
    }
}
