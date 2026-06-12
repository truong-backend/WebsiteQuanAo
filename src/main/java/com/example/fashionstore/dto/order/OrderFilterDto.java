package com.example.fashionstore.dto.order;

import lombok.*;

@Data
@Builder
public class OrderFilterDto {
    private String status;
    private Integer userId;
    private String search; // phone or order id
}