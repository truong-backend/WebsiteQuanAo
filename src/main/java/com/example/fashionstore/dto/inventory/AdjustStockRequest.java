package com.example.fashionstore.dto.inventory;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdjustStockRequest {

    @NotBlank
    private String variantId;

    /** Số lượng mới (tuyệt đối) — không phải delta */
    @Min(0)
    private int newQuantity;

    @Size(max = 500)
    private String note;
}