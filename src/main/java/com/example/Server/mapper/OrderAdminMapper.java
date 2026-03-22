package com.example.Server.mapper;

import com.example.Server.dto.response.order.OrderAdminResponse;
import com.example.Server.entity.Order;
import com.example.Server.entity.OrderItem;
import com.example.Server.entity.ProductVariant;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi Order entity sang OrderAdminResponse (chi tiết đầy đủ cho Admin).
 *
 * <p>Khác với {@link OrderMapper}, mapper này trả về:
 * <ul>
 *   <li>Thông tin tài khoản (accountId, accountName)</li>
 *   <li>Thông tin payment (paymentId, paymentType)</li>
 *   <li>Từng OrderItem với đầy đủ thông tin variant, màu, size, ảnh</li>
 *   <li>totalAmount</li>
 * </ul>
 */
public class OrderAdminMapper {

    /**
     * Chuyển đổi Order entity sang OrderAdminResponse.
     *
     * @param order entity Order (có thể null)
     * @return OrderAdminResponse hoặc null nếu input null
     */
    public static OrderAdminResponse toResponse(Order order) {
        if (order == null) return null;

        OrderAdminResponse res = new OrderAdminResponse();
        res.setId(order.getId());
        res.setOrderTime(order.getOrderTime());
        res.setPhoneNumber(order.getPhoneNumber());
        res.setAddress(order.getAddress());
        res.setNote(order.getNote());
        res.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
        res.setTotalAmount(order.getTotalAmount());

        if (order.getPayment() != null) {
            res.setPaymentId(order.getPayment().getId());
            res.setPaymentType(order.getPayment().getType() != null
                    ? order.getPayment().getType().name() : null);
        }

        if (order.getAccount() != null) {
            res.setAccountId(order.getAccount().getId());
            res.setAccountName(order.getAccount().getName());
        }

        List<OrderItem> items = order.getOrderItems() != null
                ? order.getOrderItems() : Collections.emptyList();
        res.setItems(items.stream().map(OrderAdminMapper::toItemDto).collect(Collectors.toList()));

        return res;
    }

    /**
     * Chuyển đổi danh sách Order entity sang danh sách OrderAdminResponse.
     *
     * @param orders danh sách Order (có thể null)
     * @return danh sách OrderAdminResponse
     */
    public static List<OrderAdminResponse> toResponses(List<Order> orders) {
        if (orders == null) return Collections.emptyList();
        return orders.stream().map(OrderAdminMapper::toResponse).collect(Collectors.toList());
    }

    private static OrderAdminResponse.OrderItemDto toItemDto(OrderItem item) {
        OrderAdminResponse.OrderItemDto dto = new OrderAdminResponse.OrderItemDto();
        dto.setOrderItemId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setSubtotal(item.getPrice() * item.getQuantity());

        ProductVariant variant = item.getProductVariant();
        if (variant != null) {
            dto.setProductVariantId(variant.getId());
            dto.setImg(variant.getImg());

            if (variant.getColor() != null) {
                dto.setColorCode(variant.getColor().getCode());
                dto.setColorName(variant.getColor().getName());
            }
            if (variant.getSize() != null) {
                dto.setSizeId(variant.getSize().getId());
                dto.setSizeName(variant.getSize().getName());
            }
            if (variant.getProduct() != null) {
                dto.setProductId(variant.getProduct().getId());
                dto.setProductName(variant.getProduct().getName());
            }
        }

        return dto;
    }
}
