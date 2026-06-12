package com.example.fashionstore.dto.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private long       totalOrders;
    private long       ordersThisMonth;
    private long       totalProducts;
    private long       totalUsers;
    private long       pendingOrders;
    private long       pendingReviews;
}