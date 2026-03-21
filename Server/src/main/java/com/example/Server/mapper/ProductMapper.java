package com.example.Server.mapper;

import com.example.Server.dto.response.product.ProductResponse;
import com.example.Server.entity.Product;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {
    public static ProductResponse toResponse(Product p) {
        if (p == null) return null;
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setPrice(p.getPrice());
        r.setPath(p.getPath());
        r.setImg(p.getImg());
        r.setHoverImg(p.getHoverImg());
        r.setProductTypeId(p.getParentCategory() != null ? p.getParentCategory().getCategoryId() : null);
        return r;
    }
    public static List<ProductResponse> toResponses(List<Product> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(ProductMapper::toResponse).collect(Collectors.toList());
    }
}
