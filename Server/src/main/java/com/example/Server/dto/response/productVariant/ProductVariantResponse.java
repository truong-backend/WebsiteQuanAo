package com.example.Server.dto.response.productVariant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    private String id;
    private Integer quantity;
    private String img;
    private String productId;
    private String colorCode;
    private String sizeId;
}
