package com.example.fashionstore.mapper.product;

import com.example.fashionstore.dto.product.ProductDetailDto;
import com.example.fashionstore.dto.product.ProductListDto;
import com.example.fashionstore.module.product.Product;
import com.example.fashionstore.module.variant.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductListDto toListDto(Product p) {
        List<String> colors = p.getVariants().stream()
                .map(ProductVariant::getColorName).distinct().collect(Collectors.toList());
        List<String> sizes = p.getVariants().stream()
                .map(ProductVariant::getSizeCode).distinct().collect(Collectors.toList());
        boolean inStock = p.getVariants().stream().anyMatch(v -> v.getQuantity() > 0);

        return ProductListDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .mainImage(p.getMainImage())
                .hoverImage(p.getHoverImage())
                .ratingAvg(p.getRatingAvg())
                .ratingCount(p.getRatingCount())
                .categoryName(p.getCategory() != null ? p.getCategory().getCategoryName() : null)
                .availableColors(colors)
                .availableSizes(sizes)
                .inStock(inStock)
                .deleted(p.isDeleted())          // ← THÊM DÒNG NÀY
                .deletedAt(p.getDeletedAt())
                .build();
    }

    public ProductDetailDto toDetailDto(Product p) {
        List<ProductDetailDto.VariantDto> variantDtos = p.getVariants().stream()
                .map(v -> ProductDetailDto.VariantDto.builder()
                        .id(v.getId())
                        .sku(v.getSku())
                        .colorCode(v.getColorCode())
                        .colorName(v.getColorName())
                        .sizeCode(v.getSizeCode())
                        .quantity(v.getQuantity())
                        .imageUrl(v.getImageUrl())
                        .inStock(v.getQuantity() > 0)

                        .build())
                .collect(Collectors.toList());

        ProductDetailDto.CategoryInfo catInfo = null;
        if (p.getCategory() != null) {
            catInfo = ProductDetailDto.CategoryInfo.builder()
                    .id(p.getCategory().getCategoryId())
                    .name(p.getCategory().getCategoryName())
                    .build();
        }

        return ProductDetailDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .effectivePrice(p.getEffectivePrice())
                .mainImage(p.getMainImage())
                .hoverImage(p.getHoverImage())
                .ratingAvg(p.getRatingAvg())
                .ratingCount(p.getRatingCount())
                .active(p.isActive())
                .category(catInfo)
                .variants(variantDtos)
                .createdAt(p.getCreatedAt())
                .build();
    }
}