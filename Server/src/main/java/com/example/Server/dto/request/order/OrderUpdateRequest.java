package com.example.Server.dto.request.order;

import com.example.Server.enums.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {
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
}
