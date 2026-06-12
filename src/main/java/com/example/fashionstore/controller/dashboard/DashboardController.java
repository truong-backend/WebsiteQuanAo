package com.example.fashionstore.controller.dashboard;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.dashboard.*;
import com.example.fashionstore.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    /** GET /api/v1/admin/dashboard/stats — thống kê tổng quan */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStats()));
    }

    /**
     * GET /api/v1/admin/dashboard/revenue?startDate=2025-01-01&endDate=2025-01-31
     * Doanh thu theo ngày
     */
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenueByDayDto>>> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRevenueByDay(startDate, endDate)));
    }

    /** GET /api/v1/admin/dashboard/top-products?limit=10 */
    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductDto>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getTopProducts(Math.min(limit, 50))));
    }

    /** GET /api/v1/admin/dashboard/order-status */
    @GetMapping("/order-status")
    public ResponseEntity<ApiResponse<List<OrderStatusCountDto>>> getOrderStatusDistribution() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOrderStatusDistribution()));
    }
}