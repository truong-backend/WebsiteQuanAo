package com.example.Server.dto.response.order;

import com.example.Server.dto.response.orderItem.OrderItemResponse;
import com.example.Server.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private LocalDateTime orderTime;
    private String phoneNumber;
    private String address;
    private String note;
    private OrderStatus status;
    private Integer accountId;
    private String paymentId;
    /** Chi tiết từng dòng trong đơn (khi gọi GET /orders/{id}) */
    private List<OrderItemResponse> orderItems = Collections.emptyList();
}
