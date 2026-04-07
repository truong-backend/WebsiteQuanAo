package com.example.fashionstore.controller.cart;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.cart.AddToCartRequest;
import com.example.fashionstore.dto.cart.CartDto;
import com.example.fashionstore.dto.cart.UpdateCartRequest;
import com.example.fashionstore.service.cart.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    /** GET /api/v1/cart */
    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart() {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getMyCart()));
    }

    /** POST /api/v1/cart/items */
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(@Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Đã thêm vào giỏ hàng", cartService.addToCart(req)));
    }

    /** PUT /api/v1/cart/items/{cartItemId} */
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.updateItem(cartItemId, req.getQuantity())));
    }

    /** DELETE /api/v1/cart/items/{cartItemId} */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(@PathVariable Long cartItemId) {
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa khỏi giỏ hàng", cartService.removeItem(cartItemId)));
    }

    /** DELETE /api/v1/cart */
    @DeleteMapping
    public ResponseEntity<ApiResponse<CartDto>> clearCart() {
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa giỏ hàng", cartService.clearCart()));
    }
}