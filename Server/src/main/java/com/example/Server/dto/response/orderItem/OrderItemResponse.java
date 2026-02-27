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
    /** Tên sản phẩm (từ Product) để hiển thị hóa đơn. */
    private String productName;
    /** Id sản phẩm (Product) để client hiển thị link. */
    private String productId;
}
