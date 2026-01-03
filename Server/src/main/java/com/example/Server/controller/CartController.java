package com.example.Server.controller;

import com.example.Server.dto.request.cart.CartRequest;
import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.entity.Cart;
import com.example.Server.entity.Category;
import com.example.Server.services.CartService;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Cart")
@RestController
public class CartController {
    private final CartService cartService;
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/all")
    public List<Cart> getAllCarts() {
        return cartService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveCart( CartRequest cartRequest) {
        return cartService.Create(cartRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateCart( CartRequest cartRequest) {
        return cartService.Update(cartRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteCart(String id) {
        return cartService.Delete(id);
    }
}
