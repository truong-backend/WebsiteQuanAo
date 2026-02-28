package com.example.Server.dto.request.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Một dòng trong đơn hàng khi tạo (POST /orders với orderItems).
 * Client có thể gửi productId (server sẽ chọn variant mặc định) hoặc productVariantId.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderLineRequest {

    /** Sản phẩm (server sẽ lấy variant đầu tiên của product nếu không có productVariantId) */
    private String productId;

    /** Variant cụ thể (ưu tiên nếu có) */
    private String productVariantId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "unitPrice is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "unitPrice must be positive")
    private Double unitPrice;
}
