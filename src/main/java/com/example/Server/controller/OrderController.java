package com.example.Server.controller;

import com.example.Server.dto.request.order.*;
import com.example.Server.dto.response.order.OrderBasicResponse;
import com.example.Server.enums.OrderStatus;
import com.example.Server.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

/**
 * Controller quản lý đơn hàng.
 * Base path: /orders
 */
@RestController @RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "orderTime", "phoneNumber", "address", "status");
    public OrderController(OrderService orderService) { this.orderService = orderService; }

    @GetMapping
    public ResponseEntity<Page<OrderBasicResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir, @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer accountId) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "orderTime";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(orderService.findAll(PageRequest.of(page, size, sort), search, status, startDate, endDate, accountId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderBasicResponse> getOrderById(@PathVariable String id) { return ResponseEntity.ok(orderService.getById(id)); }

    /** POST /orders — user tạo đơn hàng (mua ngay hoặc từ giỏ hàng) */
    @PostMapping
    public ResponseEntity<OrderBasicResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderBasicResponse> updateOrder(@PathVariable String id, @Valid @RequestBody OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.delete(id); return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderBasicResponse> updateOrderStatus(@PathVariable String id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    /** GET /orders/me — lịch sử đơn hàng của user hiện tại */
    @GetMapping("/me")
    public ResponseEntity<List<OrderBasicResponse>> getMyOrders() { return ResponseEntity.ok(orderService.getMyOrders()); }
}
