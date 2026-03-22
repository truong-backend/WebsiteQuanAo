package com.example.Server.dto.response.cart;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class CartResponse {
    private String id;
    private List<CartItemDto> items;
    private Double totalAmount;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CartItemDto {
        private String cartItemId;
        private String productVariantId;
        private String productId;
        private String productName;
        private String colorCode;
        private String colorName;
        private String sizeId;
        private String sizeName;
        private String img;
        private Double price;
        private Integer quantity;
        private Double subtotal;
    }
}
