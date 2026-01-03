package com.example.Server.controller;

import com.example.Server.dto.request.cart.CartRequest;
import com.example.Server.dto.request.cartItem.CartItemRequest;
import com.example.Server.entity.Cart;
import com.example.Server.entity.CartItem;
import com.example.Server.services.CartItemService;
import com.example.Server.services.CartService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/CartItem")
@RestController
public class CartItemController {
    private final CartItemService cartItemService;
    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    @GetMapping("/all")
    public List<CartItem> getAllCartItems() {
        return cartItemService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveCartItem( CartItemRequest cartItemRequest) {
        return cartItemService.Create(cartItemRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateCartItem( CartItemRequest cartItemRequest) {
        return cartItemService.Update(cartItemRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteCartItem(String id) {
        return cartItemService.Delete(id);
    }
}
