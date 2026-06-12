package com.example.fashionstore.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Message phát ra khi một đơn hàng mới được tạo thành công.
 * Consumer sẽ gửi email xác nhận đơn hàng cho khách.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedMessage implements Serializable {

    private String orderId;
    private String customerEmail;
    private String customerName;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}
