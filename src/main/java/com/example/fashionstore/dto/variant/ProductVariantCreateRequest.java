package com.example.fashionstore.dto.variant;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductVariantCreateRequest {

//    @NotBlank(message = "productId không được để trống")
    private String productId;

    @NotBlank(message = "SKU không được để trống")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "SKU chỉ chứa chữ HOA, số, dấu gạch dưới và dấu gạch ngang")
    @Size(max = 50)
    private String sku;

    @NotNull(message = "colorId không được để trống")
    private Long colorId;

    @NotNull(message = "sizeId không được để trống")
    private Long sizeId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    private Integer quantity;

    private String imageUrl;
}