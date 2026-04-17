package com.example.fashionstore.dto.review;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Integer       id;
    private String        productId;
    private Integer       userId;
    private String        userName;
    private String        userAvatar;
    private String        orderId;
    private Integer       rating;
    private String        comment;
    private boolean       approved;
    private LocalDateTime createdAt;

    private boolean       deleted;
    private LocalDateTime deletedAt;
}