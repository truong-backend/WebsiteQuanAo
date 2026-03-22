package com.example.Server.dto.response.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response đầy đủ cho Admin khi xem đơn hàng.
 *
 * <p>Bao gồm thông tin tài khoản, payment, tổng tiền và chi tiết từng sản phẩm
 * (màu, size, ảnh). Dùng cho trang quản lý đơn hàng trong admin panel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderAdminResponse {

    private String id;
    private LocalDateTime orderTime;
    private String phoneNumber;
    private String address;
    private String note;
    private String status;
    private Double totalAmount;

    // Payment info
    private String paymentId;
    private String paymentType;

    // Account info
    private Integer accountId;
    private String accountName;

    private List<OrderItemDto> items;

    /**
     * Chi tiết một dòng sản phẩm trong đơn hàng (dành cho Admin).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private String orderItemId;
        private String productVariantId;
        private String productId;
        private String productName;
        private String colorCode;
        private String colorName;
        private String sizeId;
        private String sizeName;
        private String img;
        private Integer quantity;
        private Double price;
        private Double subtotal;
    }
}
