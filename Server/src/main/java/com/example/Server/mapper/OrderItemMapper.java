package com.example.Server.mapper;

import com.example.Server.dto.response.orderitem.OrderItemResponse;
import com.example.Server.entity.OrderItem;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class OrderItemMapper {
    public static OrderItemResponse toResponse(OrderItem item) {
        if (item == null) return null;
        OrderItemResponse r = new OrderItemResponse();
        r.setId(item.getId());
        r.setQuantity(item.getQuantity());
        r.setPrice(item.getPrice());
        r.setOrderId(item.getOrder() != null ? item.getOrder().getId() : null);
        if (item.getProductVariant() != null) {
            r.setProductVariantId(item.getProductVariant().getId());
            if (item.getProductVariant().getProduct() != null) {
                r.setProductId(item.getProductVariant().getProduct().getId());
                r.setProductName(item.getProductVariant().getProduct().getName());
            }
        }
        return r;
    }
    public static List<OrderItemResponse> toResponses(List<OrderItem> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(OrderItemMapper::toResponse).collect(Collectors.toList());
    }
}
