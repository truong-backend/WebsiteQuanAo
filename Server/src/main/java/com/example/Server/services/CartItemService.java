package com.example.Server.services;

import com.example.Server.dto.request.cartItem.CartItemCreateRequest;
import com.example.Server.dto.request.cartItem.CartItemUpdateRequest;
import com.example.Server.dto.response.cartItem.CartItemResponse;
import com.example.Server.entity.Cart;
import com.example.Server.entity.CartItem;
import com.example.Server.entity.ProductVariant;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.CartItemMapper;
import com.example.Server.repository.CartItemRepository;
import com.example.Server.repository.CartRepository;
import com.example.Server.repository.ProductVariantRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;

    public CartItemService(
            CartItemRepository cartItemRepository,
            CartRepository cartRepository,
            ProductVariantRepository productVariantRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
        this.productVariantRepository = productVariantRepository;
    }

    /**
     * Find all cart items with pagination and optional filter by cartId
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<CartItemResponse> findAll(Pageable pageable, String cartId) {
        Specification<CartItem> spec = (root, query, cb) -> cb.conjunction();

        if (cartId != null && !cartId.trim().isEmpty()) {
            String cid = cartId.trim();
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("cart").get("id"), cid)
            );
        }

        return cartItemRepository
                .findAll(spec, pageable)
                .map(CartItemMapper::toResponse);
    }

    /**
     * Create a new cart item
     */
    public CartItemResponse create(CartItemCreateRequest request) {
        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", request.getCartId()));
        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId()));

        if (cartItemRepository.existsByCart_IdAndProductVariant_Id(request.getCartId(), request.getProductVariantId())) {
            throw new ResourceAlreadyExistsException(
                    "CartItem",
                    "cartId + productVariantId",
                    request.getCartId() + ", " + request.getProductVariantId()
            );
        }

        String id = request.getId() != null && !request.getId().trim().isEmpty()
                ? request.getId().trim()
                : UUID.randomUUID().toString();

        if (cartItemRepository.existsById(id)) {
            throw new ResourceAlreadyExistsException("CartItem", "id", id);
        }

        CartItem cartItem = new CartItem();
        cartItem.setId(id);
        cartItem.setQuantity(request.getQuantity());
        cartItem.setCart(cart);
        cartItem.setProductVariant(productVariant);

        CartItem saved = cartItemRepository.save(cartItem);
        return CartItemMapper.toResponse(saved);
    }

    /**
     * Update an existing cart item
     */
    public CartItemResponse update(String id, CartItemUpdateRequest request) {
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id));

        cartItem.setQuantity(request.getQuantity());

        CartItem saved = cartItemRepository.save(cartItem);
        return CartItemMapper.toResponse(saved);
    }

    /**
     * Delete a cart item by ID
     */
    public void delete(String id) {
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id));
        cartItemRepository.delete(cartItem);
    }

    /**
     * Get cart item by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public CartItemResponse getById(String id) {
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id));
        return CartItemMapper.toResponse(cartItem);
    }
}
