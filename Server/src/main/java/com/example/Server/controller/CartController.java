package com.example.Server.controller;

import com.example.Server.dto.request.cart.CartCreateRequest;
import com.example.Server.dto.request.cart.CartUpdateRequest;
import com.example.Server.dto.response.cart.CartResponse;
import com.example.Server.services.CartService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * REST Controller for Cart management
 * Base path: /carts
 */
@RestController
@RequestMapping("/carts")
public class CartController {

    private final CartService cartService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id"
    );

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Get paginated carts with filter and search
     * GET /carts
     */
    @GetMapping
    public ResponseEntity<Page<CartResponse>> getCarts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(cartService.findAll(pageable, search));
    }

    /**
     * Create cart
     * POST /carts
     */
    @PostMapping
    public ResponseEntity<CartResponse> createCart(
            @Valid @RequestBody CartCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cartService.create(request));
    }

    /**
     * Update cart
     * PUT /carts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CartResponse> updateCart(
            @PathVariable String id,
            @Valid @RequestBody CartUpdateRequest request
    ) {
        return ResponseEntity.ok(cartService.update(id, request));
    }

    /**
     * Delete cart
     * DELETE /carts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable String id) {
        cartService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get cart by id
     * GET /carts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CartResponse> getCartById(@PathVariable String id) {
        return ResponseEntity.ok(cartService.getById(id));
    }
}
