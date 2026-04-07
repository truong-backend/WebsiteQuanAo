package com.example.fashionstore.mapper.review;


import com.example.fashionstore.dto.review.ReviewDto;
import com.example.fashionstore.module.review.Review;

public class ReviewMapper {
    public static ReviewDto toDto(Review r) {
        return ReviewDto.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .userAvatar(r.getUser().getAvatarUrl())
                .orderId(r.getOrderId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}