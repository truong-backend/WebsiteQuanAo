package com.example.Server.mapper;

import com.example.Server.dto.response.productVariant.ProductVariantResponse;
import com.example.Server.entity.ProductVariant;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for ProductVariant entity and its DTOs
 */
public class ProductVariantMapper {

    /**
     * Convert ProductVariant entity to ProductVariantResponse
     */
    public static ProductVariantResponse toResponse(ProductVariant pv) {
        if (pv == null) {
            return null;
        }

        ProductVariantResponse response = new ProductVariantResponse();
        response.setId(pv.getId());
        response.setQuantity(pv.getQuantity());
        response.setImg(pv.getImg());
        response.setProductId(pv.getProduct() != null ? pv.getProduct().getId() : null);
        response.setColorCode(pv.getColor() != null ? pv.getColor().getCode() : null);
        response.setSizeId(pv.getSize() != null ? pv.getSize().getId() : null);

        return response;
    }

    /**
     * Convert list of ProductVariant entities to list of ProductVariantResponse
     */
    public static List<ProductVariantResponse> toResponses(List<ProductVariant> list) {
        if (list == null) {
            return Collections.emptyList();
        }

        return list.stream()
                .map(ProductVariantMapper::toResponse)
                .collect(Collectors.toList());
    }
}
