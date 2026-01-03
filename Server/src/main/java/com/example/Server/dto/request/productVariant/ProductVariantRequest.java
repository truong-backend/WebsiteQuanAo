package com.example.Server.dto.request.productVariant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {
    private String id;
    private Integer quantity;
    private String img;


}
