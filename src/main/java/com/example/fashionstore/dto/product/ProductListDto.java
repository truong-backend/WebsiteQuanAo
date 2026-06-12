package com.example.fashionstore.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductListDto {
    private String     id;
    private String     name;
    private String     slug;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String     mainImage;
    private String     hoverImage;
    private Double     ratingAvg;
    private Integer    ratingCount;
    private String     categoryName;
    private List<String> availableColors;
    private List<String> availableSizes;
    private boolean inStock;

    private boolean       deleted;
    private LocalDateTime deletedAt;
}