package com.example.Server.services;

import com.example.Server.dto.request.cart.CartCreateRequest;
import com.example.Server.dto.request.cart.CartUpdateRequest;
import com.example.Server.dto.response.cart.CartResponse;
import com.example.Server.entity.Account;
import com.example.Server.entity.Cart;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.CartMapper;
import com.example.Server.repository.AccountRepository;
import com.example.Server.repository.CartRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final AccountRepository accountRepository;

    public CartService(
            CartRepository cartRepository,
            AccountRepository accountRepository
    ) {
        this.cartRepository = cartRepository;
        this.accountRepository = accountRepository;
    }

    /**
     * Find all carts with pagination and optional filter by accountId
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<CartResponse> findAll(Pageable pageable, String search) {
        Specification<Cart> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = search.trim();
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("id")), "%" + keyword.toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("account").get("email")), "%" + keyword.toLowerCase() + "%")
                    )
            );
        }

        return cartRepository
                .findAll(spec, pageable)
                .map(CartMapper::toResponse);
    }

    /**
     * Create a new cart
     */
    public CartResponse create(CartCreateRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));

        if (cartRepository.existsByAccount_Id(request.getAccountId())) {
            throw new ResourceAlreadyExistsException(
                    "Cart",
                    "accountId",
                    request.getAccountId()
            );
        }

        String id = request.getId() != null && !request.getId().trim().isEmpty()
                ? request.getId().trim()
                : UUID.randomUUID().toString();

        if (cartRepository.existsById(id)) {
            throw new ResourceAlreadyExistsException("Cart", "id", id);
        }

        Cart cart = new Cart();
        cart.setId(id);
        cart.setAccount(account);

        Cart saved = cartRepository.save(cart);
        return CartMapper.toResponse(saved);
    }

    /**
     * Update an existing cart
     */
    public CartResponse update(String id, CartUpdateRequest request) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", id));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));

        if (cartRepository.existsByAccount_IdAndIdNot(request.getAccountId(), id)) {
            throw new ResourceAlreadyExistsException(
                    "Cart",
                    "accountId",
                    request.getAccountId()
            );
        }

        cart.setAccount(account);

        Cart saved = cartRepository.save(cart);
        return CartMapper.toResponse(saved);
    }

    /**
     * Delete a cart by ID
     */
    public void delete(String id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", id));

        if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete cart that contains cart items. Please remove all cart items first."
            );
        }

        cartRepository.delete(cart);
    }

    /**
     * Get cart by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public CartResponse getById(String id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", id));
        return CartMapper.toResponse(cart);
    }
}
