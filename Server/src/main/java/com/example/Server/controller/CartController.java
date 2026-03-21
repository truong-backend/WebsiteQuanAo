package com.example.Server.controller;

import com.example.Server.dto.request.cart.AddToCartRequest;
import com.example.Server.dto.response.cart.CartResponse;
import com.example.Server.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý giỏ hàng của user đang đăng nhập.
 * Base path: /carts
 */
@RestController
@RequestMapping("/carts")
public class CartController {

    private final CartService cartService;
    public CartController(CartService cartService) { this.cartService = cartService; }

    /** GET /carts/me — lấy giỏ hàng hiện tại */
    @GetMapping("/me")
    public ResponseEntity<CartResponse> getMyCart() { return ResponseEntity.ok(cartService.getMyCart()); }

    /** POST /carts/me/items — thêm sản phẩm vào giỏ */
    @PostMapping("/me/items")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    /** PUT /carts/me/items/{cartItemId}?quantity=3 — cập nhật số lượng */
    @PutMapping("/me/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(@PathVariable String cartItemId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(cartItemId, quantity));
    }

    /** DELETE /carts/me/items/{cartItemId} — xóa một item */
    @DeleteMapping("/me/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable String cartItemId) {
        return ResponseEntity.ok(cartService.removeCartItem(cartItemId));
    }

    /** DELETE /carts/me — xóa toàn bộ giỏ hàng */
    @DeleteMapping("/me")
    public ResponseEntity<Void> clearCart() { cartService.clearCart(); return ResponseEntity.noContent().build(); }
}
