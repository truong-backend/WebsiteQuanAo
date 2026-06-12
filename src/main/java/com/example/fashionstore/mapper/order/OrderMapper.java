package com.example.fashionstore.mapper.order;

import com.example.fashionstore.dto.order.OrderDto;
import com.example.fashionstore.module.order.Order;
import com.example.fashionstore.module.order.OrderItem;
import com.example.fashionstore.module.order.Payment;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderDto toDto(Order o) {
        OrderDto.UserInfo userInfo = null;
        if (o.getUser() != null) {
            userInfo = OrderDto.UserInfo.builder()
                    .id(o.getUser().getId())
                    .name(o.getUser().getName())
                    .email(o.getUser().getEmail())
                    .build();
        }

        OrderDto.PaymentInfo paymentInfo = null;
        if (o.getPayment() != null) {
            Payment p = o.getPayment();
            paymentInfo = OrderDto.PaymentInfo.builder()
                    .id(p.getId())
                    .method(p.getMethod().name())
                    .status(p.getStatus().name())
                    .amount(p.getAmount())
                    .transactionId(p.getTransactionId())
                    .payTime(p.getPayTime())
                    .build();
        }

        return OrderDto.builder()
                .id(o.getId())
                .user(userInfo)
                .phoneNumber(o.getPhoneNumber())
                .shippingAddress(o.getShippingAddress())
                .note(o.getNote())
                .subtotal(o.getSubtotal())
                .shippingFee(o.getShippingFee())
                .discountAmount(o.getDiscountAmount())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .orderTime(o.getOrderTime())
                .items(o.getItems().stream().map(this::toItemDto).collect(Collectors.toList()))
                .payment(paymentInfo)
                .build();
    }

    private OrderDto.OrderItemDto toItemDto(OrderItem i) {
        return OrderDto.OrderItemDto.builder()
                .id(i.getId())
                .variantId(i.getProductVariant() != null ? i.getProductVariant().getId() : null)
                .productName(i.getProductName())
                .variantInfo(i.getVariantInfo())
                .imageUrl(i.getImageUrl())
                .unitPrice(i.getUnitPrice())
                .quantity(i.getQuantity())
                .lineTotal(i.getLineTotal())
                .build();
    }
}