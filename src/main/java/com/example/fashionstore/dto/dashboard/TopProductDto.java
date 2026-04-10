package com.example.fashionstore.dto.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDto {
    private String     productId;
    private String     productName;
    private String     mainImage;
    private long       totalSold;
    private BigDecimal totalRevenue;
}