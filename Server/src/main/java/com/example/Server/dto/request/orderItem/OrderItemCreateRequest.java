package com.example.Server.dto.request.orderitem;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderItemCreateRequest {
    private String id;

    @NotNull @Min(1)
    private Integer quantity;

    @NotNull @DecimalMin(value = "0.0", inclusive = false)
    private Double price;

    @NotBlank(message = "orderId is required")
    private String orderId;

    @NotBlank(message = "productVariantId is required")
    private String productVariantId;
}
