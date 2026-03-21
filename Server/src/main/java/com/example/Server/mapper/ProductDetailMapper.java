package com.example.Server.mapper;

import com.example.Server.dto.response.product.ProductDetailResponse;
import com.example.Server.entity.Product;
import com.example.Server.entity.ProductVariant;
import java.util.List;
import java.util.stream.Collectors;

public class ProductDetailMapper {
    public static ProductDetailResponse toDetailResponse(Product p) {
        if (p == null) return null;
        ProductDetailResponse r = new ProductDetailResponse();
        r.setId(p.getId()); r.setName(p.getName()); r.setDescription(p.getDescription());
        r.setPrice(p.getPrice()); r.setSalePrice(p.getSalePrice());
        r.setImg(p.getImg()); r.setHoverImg(p.getHoverImg());
        r.setRating(p.getRating()); r.setRatingCount(p.getRatingCount());
        if (p.getParentCategory() != null) {
            r.setCategoryId(p.getParentCategory().getCategoryId());
            r.setCategoryName(p.getParentCategory().getCategoryName());
        }
        List<ProductVariant> variants = p.getVariants();
        if (variants != null) {
            r.setColors(variants.stream().map(ProductVariant::getColor).filter(c -> c != null).distinct()
                    .map(c -> new ProductDetailResponse.ColorDto(c.getCode(), c.getName())).collect(Collectors.toList()));
            r.setSizes(variants.stream().map(ProductVariant::getSize).filter(s -> s != null).distinct()
                    .map(s -> new ProductDetailResponse.SizeDto(s.getId(), s.getName())).collect(Collectors.toList()));
            r.setVariants(variants.stream().map(v -> new ProductDetailResponse.VariantDto(
                    v.getId(),
                    v.getColor() != null ? v.getColor().getCode() : null,
                    v.getSize()  != null ? v.getSize().getId()   : null,
                    v.getQuantity(), v.getImg()
            )).collect(Collectors.toList()));
        }
        return r;
    }
}
