package com.example.Server.dto.response.orderitem;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderItemResponse {
    private String id;
    private Integer quantity;
    private Double price;
    private String orderId;
    private String productVariantId;
    private String productName;
    private String productId;
}
