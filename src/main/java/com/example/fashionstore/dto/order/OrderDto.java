package com.example.fashionstore.dto.order;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDto {
    private String        id;
    private UserInfo      user;
    private String        phoneNumber;
    private String        shippingAddress;
    private String        note;
    private BigDecimal    subtotal;
    private BigDecimal    shippingFee;
    private BigDecimal    discountAmount;
    private BigDecimal    totalAmount;
    private String        status;
    private LocalDateTime orderTime;
    private List<OrderItemDto> items;
    private PaymentInfo   payment;

    @Data @Builder
    public static class UserInfo {
        private Integer id;
        private String  name;
        private String  email;
    }

    @Data @Builder
    public static class OrderItemDto {
        private String     id;
        private String     variantId;
        private String     productName;
        private String     variantInfo;
        private String     imageUrl;
        private BigDecimal unitPrice;
        private Integer    quantity;
        private BigDecimal lineTotal;
    }

    @Data @Builder
    public static class PaymentInfo {
        private String        id;
        private String        method;
        private String        status;
        private BigDecimal    amount;
        private String        transactionId;
        private LocalDateTime payTime;
    }
}