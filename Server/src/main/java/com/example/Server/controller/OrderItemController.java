package com.example.Server.controller;

import com.example.Server.dto.request.orderitem.*;
import com.example.Server.dto.response.orderitem.OrderItemResponse;
import com.example.Server.service.OrderItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

/** Base path: /order-items */
@RestController @RequestMapping("/order-items")
public class OrderItemController {
    private final OrderItemService orderItemService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "quantity", "price");
    public OrderItemController(OrderItemService orderItemService) { this.orderItemService = orderItemService; }

    @GetMapping
    public ResponseEntity<Page<OrderItemResponse>> getOrderItems(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String productVariantId,
            @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(orderItemService.findAll(PageRequest.of(page, size, sort), search, orderId, productVariantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItemResponse> getOrderItemById(@PathVariable String id) { return ResponseEntity.ok(orderItemService.getById(id)); }

    @PostMapping
    public ResponseEntity<OrderItemResponse> createOrderItem(@Valid @RequestBody OrderItemCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderItemService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderItemResponse> updateOrderItem(@PathVariable String id, @Valid @RequestBody OrderItemUpdateRequest request) {
        return ResponseEntity.ok(orderItemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItem(@PathVariable String id) {
        orderItemService.delete(id); return ResponseEntity.noContent().build();
    }
}
