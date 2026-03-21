package com.example.Server.dto.response.product;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductDetailResponse {
    private String id;
    private String name;
    private String description;
    private Double price;
    private Double salePrice;
    private String img;
    private String hoverImg;
    private Double rating;
    private Integer ratingCount;
    private Long categoryId;
    private String categoryName;
    private List<ColorDto> colors;
    private List<SizeDto> sizes;
    private List<VariantDto> variants;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ColorDto   { private String code; private String name; }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SizeDto    { private String id;   private String name; }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VariantDto {
        private String id;
        private String colorCode;
        private String sizeId;
        private Integer quantity;
        private String img;
    }
}
