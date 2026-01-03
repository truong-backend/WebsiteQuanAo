package com.example.Server.services;

import com.example.Server.dto.request.cart.CartRequest;
import com.example.Server.dto.request.color.ColorRequest;
import com.example.Server.entity.Cart;
import com.example.Server.entity.Color;
import com.example.Server.repository.CartRepository;
import com.example.Server.repository.CategoryRepository;
import com.example.Server.repository.ColorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;


    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public List<Cart> findAll() {
        return cartRepository.findAll();
    }

    public Boolean Create(CartRequest cartRequest) {
        if (!cartRepository.existsById(cartRequest.getId())) {
            Cart cartEntity = new Cart();
            cartEntity.setId(cartRequest.getId());
            cartRepository.save(cartEntity);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( CartRequest CartRequest) {
        if (cartRepository.existsById(CartRequest.getId())) {
            Optional<Cart> cart = cartRepository.findById(CartRequest.getId());
            cart.get().setId(CartRequest.getId());
            cartRepository.save(cart.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (cartRepository.existsById(id)) {
            cartRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
