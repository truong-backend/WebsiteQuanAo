package com.example.Server.dto.request.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request tạo thanh toán MoMo cho một đơn hàng (cùng format với VNPAY).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomoCreatePaymentRequest {

    @NotBlank(message = "orderId is required")
    private String orderId;

    @Min(value = 1, message = "amount must be > 0")
    private long amount;
}
