package com.example.Server.mapper;

import com.example.Server.dto.response.orderItem.OrderItemResponse;
import com.example.Server.entity.OrderItem;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for OrderItem entity and its DTOs
 */
public class OrderItemMapper {

    public static OrderItemResponse toResponse(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());
        response.setOrderId(orderItem.getOrder() != null ? orderItem.getOrder().getId() : null);
        if (orderItem.getProductVariant() != null) {
            response.setProductVariantId(orderItem.getProductVariant().getId());
            if (orderItem.getProductVariant().getProduct() != null) {
                response.setProductName(orderItem.getProductVariant().getProduct().getName());
                response.setProductId(orderItem.getProductVariant().getProduct().getId());
            }
        }
        return response;
    }

    public static List<OrderItemResponse> toResponses(List<OrderItem> orderItems) {
        if (orderItems == null) {
            return Collections.emptyList();
        }
        return orderItems.stream()
                .map(OrderItemMapper::toResponse)
                .collect(Collectors.toList());
    }
}
