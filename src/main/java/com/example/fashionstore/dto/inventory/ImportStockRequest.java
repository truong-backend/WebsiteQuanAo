package com.example.fashionstore.dto.inventory;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ImportStockRequest {

    @NotBlank
    private String variantId;

    @Min(1)
    private int quantity;

    @Size(max = 500)
    private String note;
}