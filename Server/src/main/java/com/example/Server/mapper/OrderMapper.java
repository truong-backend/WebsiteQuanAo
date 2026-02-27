package com.example.Server.mapper;

import com.example.Server.dto.response.order.OrderResponse;
import com.example.Server.entity.Order;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Order entity and its DTOs
 */
public class OrderMapper {

    /**
     * Convert Order entity to OrderResponse (có thể gồm orderItems nếu đã load)
     */
    public static OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }

        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderTime(order.getOrderTime());
        response.setPhoneNumber(order.getPhoneNumber());
        response.setAddress(order.getAddress());
        response.setNote(order.getNote());
        response.setStatus(order.getStatus());
        response.setAccountId(order.getAccount() != null ? order.getAccount().getId() : null);
        response.setPaymentId(order.getPayment() != null ? order.getPayment().getId() : null);
        response.setOrderItems(order.getOrderItems() != null && !order.getOrderItems().isEmpty()
                ? OrderItemMapper.toResponses(order.getOrderItems())
                : Collections.emptyList());

        return response;
    }

    /**
     * Convert list of Order entities to list of OrderResponse
     */
    public static List<OrderResponse> toResponses(List<Order> orders) {
        if (orders == null) {
            return Collections.emptyList();
        }

        return orders.stream()
                .map(OrderMapper::toResponse)
                .collect(Collectors.toList());
    }
}
