package com.example.fashionstore.dto.review;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewRequest {

    private String productId;

    /** Bắt buộc — dùng để verify user đã mua sản phẩm trong đơn này */
    @NotBlank(message = "Vui lòng chọn đơn hàng đã mua để đánh giá")
    private String orderId;

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    @Size(max = 1000)
    private String comment;
}