package com.example.Server.controller;

import com.example.Server.dto.request.cartItem.CartItemCreateRequest;
import com.example.Server.dto.request.cartItem.CartItemUpdateRequest;
import com.example.Server.dto.response.cartItem.CartItemResponse;
import com.example.Server.services.CartItemService;
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
 * REST Controller for CartItem management
 * Base path: /cart-items
 */
@RestController
@RequestMapping("/cart-items")
public class CartItemController {

    private final CartItemService cartItemService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "quantity"
    );

    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    /**
     * Get paginated cart items with optional filter by cartId
     * GET /cart-items
     */
    @GetMapping
    public ResponseEntity<Page<CartItemResponse>> getCartItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String cartId,
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

        return ResponseEntity.ok(cartItemService.findAll(pageable, cartId));
    }

    /**
     * Create cart item
     * POST /cart-items
     */
    @PostMapping
    public ResponseEntity<CartItemResponse> createCartItem(
            @Valid @RequestBody CartItemCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cartItemService.create(request));
    }

    /**
     * Update cart item
     * PUT /cart-items/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            @PathVariable String id,
            @Valid @RequestBody CartItemUpdateRequest request
    ) {
        return ResponseEntity.ok(cartItemService.update(id, request));
    }

    /**
     * Delete cart item
     * DELETE /cart-items/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable String id) {
        cartItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get cart item by id
     * GET /cart-items/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CartItemResponse> getCartItemById(@PathVariable String id) {
        return ResponseEntity.ok(cartItemService.getById(id));
    }
}
