package com.example.fashionstore.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Message phát ra khi trạng thái đơn hàng thay đổi.
 * Consumer gửi email thông báo cập nhật cho khách.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangedMessage implements Serializable {

    private String orderId;
    private String customerEmail;
    private String customerName;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime changedAt;
}
