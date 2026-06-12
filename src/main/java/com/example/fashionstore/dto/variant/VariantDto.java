package com.example.fashionstore.dto.variant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VariantDto {
    private String  id;
    private String  sku;
    private String  productId;
    private String  productName;

    // Color info
    private Long    colorId;
    private String  colorCode;
    private String  colorName;

    // Size info
    private Long    sizeId;
    private String  sizeCode;
    private String  sizeName;

    private Integer quantity;
    private boolean inStock;
    private String  imageUrl;
}