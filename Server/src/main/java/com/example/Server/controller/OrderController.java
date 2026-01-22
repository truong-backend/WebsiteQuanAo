package com.example.Server.controller;

import com.example.Server.dto.request.order.OrderCreateRequest;
import com.example.Server.dto.request.order.OrderUpdateRequest;
import com.example.Server.dto.response.order.OrderResponse;
import com.example.Server.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * REST Controller for Order management
 * Base path: /orders
 */
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "orderTime",
            "phoneNumber",
            "address",
            "status"
    );

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Get paginated orders with filter and search
     * GET /orders
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "orderTime";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(orderService.findAll(pageable, search));
    }

    /**
     * Get order by id
     * GET /orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    /**
     * Create order
     * POST /orders
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderService.create(request));
    }

    /**
     * Update order
     * PUT /orders/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable String id,
            @Valid @RequestBody OrderUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.update(id, request));
    }

    /**
     * Delete order
     * DELETE /orders/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
