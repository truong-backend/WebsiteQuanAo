package com.example.Server.dto.request.productType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductTypeRequest {
    private Long productId;
    private String productName;
}
