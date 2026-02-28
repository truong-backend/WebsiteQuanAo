package com.example.Server.dto.request.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request tạo URL thanh toán VNPAY cho một đơn hàng.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VnpayCreatePaymentRequest {

    /**
     * Mã đơn hàng (Order.id) sẽ được dùng cho vnp_TxnRef.
     */
    @NotBlank(message = "orderId is required")
    private String orderId;

    /**
     * Số tiền thanh toán (VND).
     */
    @Min(value = 1, message = "amount must be > 0")
    private long amount;
}

