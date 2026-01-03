package com.example.Server.dto.request.orderItem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OderItemRequest {
    private String id;
    private Integer quantity;
    private Double price;
}
