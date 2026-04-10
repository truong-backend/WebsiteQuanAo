package com.example.fashionstore.dto.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueByDayDto {
    private String     date;     // "2025-01-15"
    private BigDecimal revenue;
    private long       orders;
}