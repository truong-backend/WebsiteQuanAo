package com.example.fashionstore.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductFilterDto {
    private String     search;
    private Long       categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String     colorCode;
    private String     sizeCode;
    private boolean includeDeleted;

    private boolean       deleted;
    private LocalDateTime deletedAt;

}