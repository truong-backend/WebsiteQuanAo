package com.example.fashionstore.dto.review;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotBlank
    private String productId;

    private String orderId;  // Optional — để verify đã mua

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    @Size(max = 1000)
    private String comment;
}