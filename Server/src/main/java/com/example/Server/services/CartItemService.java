package com.example.Server.services;

import com.example.Server.dto.request.cartItem.CartItemRequest;
import com.example.Server.dto.request.color.ColorRequest;
import com.example.Server.entity.CartItem;
import com.example.Server.entity.Color;
import com.example.Server.repository.CartItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemService {
    private final CartItemRepository cartItemRepository;
    public CartItemService(CartItemRepository cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }

    public List<CartItem> findAll() {
        return cartItemRepository.findAll();
    }

    public Boolean Create(CartItemRequest cartItemRequest) {
        if (!cartItemRepository.existsById(cartItemRequest.getId())) {
            CartItem cartItem = new CartItem();
            cartItem.setId(cartItemRequest.getId());
            cartItem.setQuantity(cartItemRequest.getQuantity());
            cartItem.setCart(cartItemRequest.getCart());
            cartItemRepository.save(cartItem);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( CartItemRequest cartItemRequest) {
        if (cartItemRepository.existsById(cartItemRequest.getId())) {
            Optional<CartItem> cartItem = cartItemRepository.findById(cartItemRequest.getId());
            cartItem.get().setQuantity(cartItemRequest.getQuantity());
            cartItem.get().setCart(cartItemRequest.getCart());
            cartItemRepository.save(cartItem.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (cartItemRepository.existsById(id)) {
            cartItemRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
