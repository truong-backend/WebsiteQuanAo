package com.example.Server.dto.response.order;

import com.example.Server.dto.response.orderitem.OrderItemResponse;
import com.example.Server.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Response cơ bản cho đơn hàng.
 *
 * <p>Dùng cho:
 * <ul>
 *   <li>GET /orders/{id} — user xem đơn hàng của mình</li>
 *   <li>GET /accounts/{id}/orders — lịch sử đơn hàng theo account</li>
 * </ul>
 *
 * Để xem thông tin admin đầy đủ (tên account, loại payment, tổng tiền),
 * sử dụng {@link OrderAdminResponse}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderBasicResponse {

    private String id;
    private LocalDateTime orderTime;
    private String phoneNumber;
    private String address;
    private String note;
    private OrderStatus status;
    private Integer accountId;
    private String paymentId;

    /** Chi tiết từng dòng trong đơn (lazy-loaded). */
    private List<OrderItemResponse> orderItems = Collections.emptyList();
}
