package com.example.fashionstore.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductDetailDto {
    private String     id;
    private String     name;
    private String     slug;
    private String     description;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private String     mainImage;
    private String     hoverImage;
    private Double     ratingAvg;
    private Integer    ratingCount;
    private boolean    active;
    private CategoryInfo category;
    private List<VariantDto> variants;
    private LocalDateTime createdAt;

    private boolean       deleted;
    private LocalDateTime deletedAt;

    @Data
    @Builder
    public static class CategoryInfo {
        private Long   id;
        private String name;
        // FIX: Bỏ field slug vì Category entity không có slug
    }

    @Data
    @Builder
    public static class VariantDto {
        private String  id;
        private String  sku;
        private String  colorCode;
        private String  colorName;
        private String  sizeCode;
        private Integer quantity;
        private String  imageUrl;
        private boolean inStock;
    }
}