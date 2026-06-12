package com.example.fashionstore.dto.cart;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartDto {
    private Long   cartId;
    private int    totalItems;
    private BigDecimal subtotal;
    private List<CartItemDto> items;

    @Data
    @Builder
    public static class CartItemDto {
        private Long    cartItemId;
        private String  variantId;
        private String  sku;
        private String  productId;
        private String  productName;
        private String  productSlug;
        private String  colorCode;
        private String  colorName;
        private String  sizeCode;
        private String  imageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private Integer stockQuantity;
        private BigDecimal lineTotal;
    }
}