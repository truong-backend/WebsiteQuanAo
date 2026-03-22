package com.example.Server.service;

import com.example.Server.dto.request.cartitem.CartItemCreateRequest;
import com.example.Server.dto.request.cartitem.CartItemUpdateRequest;
import com.example.Server.dto.response.cartitem.CartItemResponse;
import com.example.Server.entity.*;
import com.example.Server.exception.*;
import com.example.Server.mapper.CartItemMapper;
import com.example.Server.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.UUID;

/** Service CRUD CartItem (dùng cho admin quản lý trực tiếp). */
@Service @Transactional
public class CartItemService {
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;

    public CartItemService(CartItemRepository cartItemRepository, CartRepository cartRepository,
                           ProductVariantRepository productVariantRepository) {
        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<CartItemResponse> findAll(Pageable pageable, String cartId) {
        Specification<CartItem> spec = (root, q, cb) -> cb.conjunction();
        if (cartId != null && !cartId.trim().isEmpty())
            spec = spec.and((root, q, cb) -> cb.equal(root.get("cart").get("id"), cartId.trim()));
        return cartItemRepository.findAll(spec, pageable).map(CartItemMapper::toResponse);
    }

    public CartItemResponse create(CartItemCreateRequest request) {
        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", request.getCartId()));
        ProductVariant pv = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId()));
        if (cartItemRepository.existsByCart_IdAndProductVariant_Id(request.getCartId(), request.getProductVariantId()))
            throw new ResourceAlreadyExistsException("CartItem", "cartId+productVariantId", request.getCartId());

        String id = (request.getId() != null && !request.getId().trim().isEmpty())
                ? request.getId().trim() : UUID.randomUUID().toString();
        if (cartItemRepository.existsById(id)) throw new ResourceAlreadyExistsException("CartItem", "id", id);

        CartItem item = new CartItem(); item.setId(id); item.setQuantity(request.getQuantity());
        item.setCart(cart); item.setProductVariant(pv);
        return CartItemMapper.toResponse(cartItemRepository.save(item));
    }

    public CartItemResponse update(String id, CartItemUpdateRequest request) {
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id));
        item.setQuantity(request.getQuantity());
        return CartItemMapper.toResponse(cartItemRepository.save(item));
    }

    public void delete(String id) {
        cartItemRepository.delete(cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id)));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public CartItemResponse getById(String id) {
        return CartItemMapper.toResponse(cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id)));
    }
}
