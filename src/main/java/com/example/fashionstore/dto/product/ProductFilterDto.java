package com.example.fashionstore.dto.product;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
public class ProductFilterDto {
    private String     search;
    private Long       categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String     colorCode;
    private String     sizeCode;
}