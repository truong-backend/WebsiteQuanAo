package com.example.Server.mapper;

import com.example.Server.dto.response.product.ProductListItemResponse;
import com.example.Server.dto.response.product.ProductOptionResponse;
import com.example.Server.dto.response.product.ProductResponse;
import com.example.Server.entity.Product;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Product entity and its DTOs
 */
public class ProductMapper {

    /**
     * Convert Product entity to ProductResponse
     */
    public static ProductResponse toResponse(Product product) {
        if (product == null) {
            return null;
        }

        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setPath(product.getPath());
        response.setImg(product.getImg());
        response.setHoverImg(product.getHoverImg());
        response.setProductTypeId(product.getParentCategory() != null ? product.getParentCategory().getCategoryId() : null);

        return response;
    }

    /**
     * Convert list of Product entities to list of ProductResponse
     */
    public static List<ProductResponse> toResponses(List<Product> products) {
        if (products == null) {
            return Collections.emptyList();
        }

        return products.stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
    }

    public static ProductOptionResponse toOptionResponse(Product product) {
        ProductOptionResponse response = new ProductOptionResponse();
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        return response;
    }

    public static List<ProductOptionResponse> toOptionResponseList(List<Product> products) {
        return products.stream()
                .map(ProductMapper::toOptionResponse)
                .collect(Collectors.toList());
    }

    public static ProductListItemResponse toListItemResponse(Product product) {
        if (product == null) {
            return null;
        }

        ProductListItemResponse response = new ProductListItemResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setImg(product.getImg());
        response.setDescription(product.getDescription());

        if (product.getParentCategory() != null) {
            response.setCategoryId(Math.toIntExact(product.getParentCategory().getCategoryId()));
            response.setCategoryName(product.getParentCategory().getCategoryName());
        }

        return response;
    }
}
