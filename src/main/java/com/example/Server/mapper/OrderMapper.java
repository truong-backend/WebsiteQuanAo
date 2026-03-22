package com.example.Server.mapper;

import com.example.Server.dto.response.order.OrderBasicResponse;
import com.example.Server.dto.response.orderitem.OrderItemResponse;
import com.example.Server.entity.Order;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi Order entity sang OrderBasicResponse.
 *
 * <p>Dùng cho các endpoint trả về thông tin cơ bản của đơn hàng
 * (không bao gồm chi tiết sản phẩm/variant đầy đủ như {@link OrderAdminMapper}).
 */
public class OrderMapper {

    /**
     * Chuyển đổi Order entity sang OrderBasicResponse.
     * Tự động map orderItems nếu đã được lazy-load.
     *
     * @param order entity Order (có thể null)
     * @return OrderBasicResponse hoặc null nếu input null
     */
    public static OrderBasicResponse toResponse(Order order) {
        if (order == null) return null;

        OrderBasicResponse response = new OrderBasicResponse();
        response.setId(order.getId());
        response.setOrderTime(order.getOrderTime());
        response.setPhoneNumber(order.getPhoneNumber());
        response.setAddress(order.getAddress());
        response.setNote(order.getNote());
        response.setStatus(order.getStatus());
        response.setAccountId(order.getAccount() != null ? order.getAccount().getId() : null);
        response.setPaymentId(order.getPayment() != null ? order.getPayment().getId() : null);
        response.setOrderItems(
                order.getOrderItems() != null && !order.getOrderItems().isEmpty()
                        ? OrderItemMapper.toResponses(order.getOrderItems())
                        : Collections.emptyList()
        );

        return response;
    }

    /**
     * Chuyển đổi danh sách Order entity sang danh sách OrderBasicResponse.
     *
     * @param orders danh sách Order (có thể null)
     * @return danh sách OrderBasicResponse, trả về list rỗng nếu input null
     */
    public static List<OrderBasicResponse> toResponses(List<Order> orders) {
        if (orders == null) return Collections.emptyList();
        return orders.stream()
                .map(OrderMapper::toResponse)
                .collect(Collectors.toList());
    }
}
