package com.example.Server.mapper;

import com.example.Server.dto.response.productType.ProductTypeResponse;
import com.example.Server.entity.ProductType;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for ProductType entity and its DTOs
 */
public class ProductTypeMapper {

    /**
     * Convert ProductType entity to ProductTypeResponse
     */
    public static ProductTypeResponse toResponse(ProductType pt) {
        if (pt == null) {
            return null;
        }

        ProductTypeResponse response = new ProductTypeResponse();
        response.setProductId(pt.getProductId());
        response.setProductName(pt.getProductName());
//        response.setParentProductId(pt.getParentProduct() != null ? pt.getParentProduct().getProductId() : null);

        return response;
    }

    /**
     * Convert list of ProductType entities to list of ProductTypeResponse
     */
    public static List<ProductTypeResponse> toResponses(List<ProductType> list) {
        if (list == null) {
            return Collections.emptyList();
        }

        return list.stream()
                .map(ProductTypeMapper::toResponse)
                .collect(Collectors.toList());
    }
}
