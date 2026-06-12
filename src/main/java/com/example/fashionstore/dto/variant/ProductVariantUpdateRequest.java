package com.example.fashionstore.dto.variant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductVariantUpdateRequest {

    @NotNull(message = "colorId không được để trống")
    private Long colorId;

    @NotNull(message = "sizeId không được để trống")
    private Long sizeId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    private Integer quantity;

    private String imageUrl;
}