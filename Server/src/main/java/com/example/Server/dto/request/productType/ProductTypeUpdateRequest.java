package com.example.Server.dto.request.productType;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductTypeUpdateRequest {

    @NotBlank(message = "Product type name is required")
    private String productName;

    private Long parentProductId;
}
