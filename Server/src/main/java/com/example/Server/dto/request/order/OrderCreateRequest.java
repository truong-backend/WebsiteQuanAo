package com.example.Server.dto.request.order;

import com.example.Server.enums.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {
    private String id;

    @NotNull(message = "orderTime is required")
    private LocalDateTime orderTime;

    @NotBlank(message = "phoneNumber is required")
    private String phoneNumber;

    @NotBlank(message = "address is required")
    private String address;

    private String note;

    @NotNull(message = "status is required")
    private OrderStatus status;

    private Integer accountId;
    private String paymentId;

    /** Chi tiết sản phẩm trong đơn (tùy chọn). Client gửi productId + quantity + unitPrice hoặc productVariantId + quantity + unitPrice. */
    private List<@Valid OrderLineRequest> orderItems;
}
