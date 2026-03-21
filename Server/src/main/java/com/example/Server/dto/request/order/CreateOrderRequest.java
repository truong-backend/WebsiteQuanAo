package com.example.Server.dto.request.order;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

/** Request tạo đơn hàng — Mua ngay hoặc từ giỏ hàng. */
@Data
public class CreateOrderRequest {
    @NotBlank(message = "phoneNumber is required")
    private String phoneNumber;

    @NotBlank(message = "address is required")
    private String address;

    private String note;

    @NotBlank(message = "paymentType is required")
    private String paymentType;

    @NotNull
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotBlank
        private String productVariantId;

        @NotNull @Min(1)
        private Integer quantity;
    }
}
