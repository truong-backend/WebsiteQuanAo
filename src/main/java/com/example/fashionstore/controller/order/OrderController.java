package com.example.fashionstore.controller.order;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.order.CreateOrderRequest;
import com.example.fashionstore.dto.order.OrderDto;
import com.example.fashionstore.dto.order.OrderFilterDto;
import com.example.fashionstore.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService ;

    /** POST /api/v1/orders — Tạo đơn hàng (authenticated) */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody CreateOrderRequest req) {
        OrderDto order = orderService.createOrder(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(order));
    }

    /** GET /api/v1/orders/my — Lịch sử đơn của user hiện tại */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders()));
    }

    /** GET /api/v1/orders/{id} — Chi tiết đơn (user xem đơn của mình, admin xem tất) */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getById(id)));
    }

    /** POST /api/v1/orders/{id}/cancel — Hủy đơn (chỉ khi PENDING) */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto>> cancel(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy đơn hàng", orderService.cancelOrder(id)));
    }

    // ── Admin endpoints ──────────────────────────────────────────────

    /** GET /api/v1/orders — Admin: danh sách tất cả đơn */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "20")   int    size,
            @RequestParam(required = false)       String status,
            @RequestParam(required = false)       String search,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc")  String sortDir) {

        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        OrderFilterDto filter = OrderFilterDto.builder().status(status).search(search).build();
        Page<OrderDto> result = orderService.findAll(PageRequest.of(page, size, sort), filter);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /** PATCH /api/v1/orders/{id}/status — Admin: cập nhật trạng thái */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {

        System.out.println("STATUS RAW = [" + status + "]");
        return ResponseEntity.ok(ApiResponse.ok(
                orderService.updateStatus(id, com.example.fashionstore.module.order.Order.OrderStatus.valueOf(status.toUpperCase()))
        ));
    }
}