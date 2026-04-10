package com.example.fashionstore.service.dashboard;

import com.example.fashionstore.dto.dashboard.*;
import com.example.fashionstore.module.order.Order.OrderStatus;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.repository.product.ProductRepository;
import com.example.fashionstore.repository.review.ReviewRepository;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final OrderRepository   orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository    userRepository;
    private final ReviewRepository  reviewRepository;

    // ── Tổng quan ────────────────────────────────────────────────────

    public DashboardStatsDto getStats() {
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime now          = LocalDateTime.now();

        BigDecimal totalRevenue     = orderRepository.sumTotalRevenue();
        BigDecimal revenueThisMonth = orderRepository.sumRevenueInRange(startOfMonth, now);
        long totalOrders            = orderRepository.count();
        long ordersThisMonth        = orderRepository.countCreatedBetween(startOfMonth, now);
        long totalProducts          = productRepository.count();
        long totalUsers             = userRepository.count();
        long pendingOrders          = orderRepository.countByStatus(OrderStatus.PENDING);
        long pendingReviews         = reviewRepository.countByApproved(false);

        return DashboardStatsDto.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .ordersThisMonth(ordersThisMonth)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .pendingOrders(pendingOrders)
                .pendingReviews(pendingReviews)
                .build();
    }

    // ── Doanh thu theo ngày ──────────────────────────────────────────

    /**
     * Doanh thu theo ngày trong khoảng [startDate, endDate].
     * Mặc định: 30 ngày gần nhất.
     */
    public List<RevenueByDayDto> getRevenueByDay(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(29);
        if (endDate   == null) endDate   = LocalDate.now();

        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to   = endDate.atTime(23, 59, 59);

        List<Object[]> raw = orderRepository.revenueByDay(from, to);

        // Tạo map ngày → data
        Map<String, RevenueByDayDto> resultMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Điền tất cả các ngày trong khoảng (kể cả ngày không có đơn = 0)
        LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            String key = cur.format(fmt);
            resultMap.put(key, RevenueByDayDto.builder()
                    .date(key)
                    .revenue(BigDecimal.ZERO)
                    .orders(0L)
                    .build());
            cur = cur.plusDays(1);
        }

        // Merge dữ liệu từ DB
        for (Object[] row : raw) {
            String  date    = row[0].toString();
            BigDecimal rev  = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            long   cnt      = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            if (resultMap.containsKey(date)) {
                resultMap.put(date, RevenueByDayDto.builder()
                        .date(date)
                        .revenue(rev)
                        .orders(cnt)
                        .build());
            }
        }

        return new ArrayList<>(resultMap.values());
    }

    // ── Top sản phẩm bán chạy ───────────────────────────────────────

    public List<TopProductDto> getTopProducts(int limit) {
        List<Object[]> raw = orderRepository.topProductsBySold(limit);
        return raw.stream()
                .map(row -> TopProductDto.builder()
                        .productId((String) row[0])
                        .productName((String) row[1])
                        .mainImage((String) row[2])
                        .totalSold(((Number) row[3]).longValue())
                        .totalRevenue(row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    // ── Phân bố trạng thái đơn ──────────────────────────────────────

    public List<OrderStatusCountDto> getOrderStatusDistribution() {
        return Arrays.stream(OrderStatus.values())
                .map(status -> OrderStatusCountDto.builder()
                        .status(status)
                        .count(orderRepository.countByStatus(status))
                        .build())
                .toList();
    }
}
