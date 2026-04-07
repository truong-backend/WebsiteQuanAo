package com.example.fashionstore.dto.review;

import com.example.fashionstore.module.review.Review;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewDto {
    private Integer       id;
    private String        productId;
    private Integer       userId;
    private String        userName;
    private String        userAvatar;
    private String        orderId;
    private Integer       rating;
    private String        comment;
    private LocalDateTime createdAt;
}