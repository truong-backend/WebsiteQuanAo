package com.example.Server.dto.response.order;

import com.example.Server.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
}
