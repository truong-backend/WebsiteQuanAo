package com.example.Server.controller;

import com.example.Server.dto.request.cartitem.*;
import com.example.Server.dto.response.cartitem.CartItemResponse;
import com.example.Server.service.CartItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

/**
 * Controller CRUD CartItem (dành cho Admin).
 * Base path: /cart-items
 */
@RestController
@RequestMapping("/cart-items")
public class CartItemController {

    private final CartItemService cartItemService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "quantity");

    public CartItemController(CartItemService cartItemService) { this.cartItemService = cartItemService; }

    @GetMapping
    public ResponseEntity<Page<CartItemResponse>> getCartItems(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String cartId,
            @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(cartItemService.findAll(PageRequest.of(page, size, sort), cartId));
    }

    @PostMapping
    public ResponseEntity<CartItemResponse> createCartItem(@Valid @RequestBody CartItemCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartItemService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponse> updateCartItem(@PathVariable String id, @Valid @RequestBody CartItemUpdateRequest request) {
        return ResponseEntity.ok(cartItemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable String id) {
        cartItemService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartItemResponse> getCartItemById(@PathVariable String id) {
        return ResponseEntity.ok(cartItemService.getById(id));
    }
}
