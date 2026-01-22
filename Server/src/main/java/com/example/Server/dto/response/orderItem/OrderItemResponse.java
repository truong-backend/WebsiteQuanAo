package com.example.Server.dto.response.orderItem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private String id;
    private Integer quantity;
    private Double price;
    private String orderId;
    private String productVariantId;
}
