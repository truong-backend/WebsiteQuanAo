package com.example.Server.mapper;

import com.example.Server.dto.response.productvariant.ProductVariantResponse;
import com.example.Server.entity.ProductVariant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductVariantMapper {
    public static ProductVariantResponse toResponse(ProductVariant pv) {
        if (pv == null) return null;
        ProductVariantResponse r = new ProductVariantResponse();
        r.setId(pv.getId());
        r.setQuantity(pv.getQuantity());
        r.setImg(pv.getImg());
        r.setProductId(pv.getProduct() != null ? pv.getProduct().getId() : null);
        r.setProductName(pv.getProduct() != null ? pv.getProduct().getName() : null);
        r.setColorCode(pv.getColor() != null ? pv.getColor().getCode() : null);
        r.setColorName(pv.getColor() != null ? pv.getColor().getName() : null);
        r.setSizeId(pv.getSize() != null ? pv.getSize().getId() : null);
        return r;
    }
    public static List<ProductVariantResponse> toResponses(List<ProductVariant> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(ProductVariantMapper::toResponse).collect(Collectors.toList());
    }
}
