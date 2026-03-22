package com.example.Server.mapper;

import com.example.Server.dto.response.product.ProductListItemResponse;
import com.example.Server.entity.Product;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductListItemMapper {
    public static ProductListItemResponse toResponse(Product p) {
        if (p == null) return null;
        ProductListItemResponse r = new ProductListItemResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setPrice(p.getPrice());
        r.setImg(p.getImg());
        r.setDescription(p.getDescription());
        if (p.getParentCategory() != null) {
            r.setCategoryId(Math.toIntExact(p.getParentCategory().getCategoryId()));
            r.setCategoryName(p.getParentCategory().getCategoryName());
        }
        return r;
    }
    public static List<ProductListItemResponse> toResponses(List<Product> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(ProductListItemMapper::toResponse).collect(Collectors.toList());
    }
}
