package com.example.fashionstore.dto.dashboard;

import com.example.fashionstore.module.order.Order.OrderStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusCountDto {
    private String status;
    private long        count;
}