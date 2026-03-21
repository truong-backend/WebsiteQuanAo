package com.example.Server.dto.response.productvariant;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductVariantResponse {
    private String id;
    private Integer quantity;
    private String img;
    private String productId;
    private String productName;
    private String colorCode;
    private String colorName;
    private String sizeId;
}
