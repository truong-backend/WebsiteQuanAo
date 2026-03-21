package com.example.Server.mapper;

import com.example.Server.dto.response.product.ProductOptionResponse;
import com.example.Server.entity.Product;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductOptionMapper {
    public static ProductOptionResponse toResponse(Product p) {
        if (p == null) return null;
        ProductOptionResponse r = new ProductOptionResponse();
        r.setProductId(p.getId());
        r.setProductName(p.getName());
        return r;
    }
    public static List<ProductOptionResponse> toResponses(List<Product> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(ProductOptionMapper::toResponse).collect(Collectors.toList());
    }
}
