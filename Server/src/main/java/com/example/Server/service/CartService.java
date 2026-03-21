package com.example.Server.service;

import com.example.Server.dto.request.cart.AddToCartRequest;
import com.example.Server.dto.response.cart.CartResponse;
import com.example.Server.entity.*;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.CartMapper;
import com.example.Server.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

/**
 * Service quản lý giỏ hàng của user.
 * Mỗi user chỉ có một Cart, tự động tạo nếu chưa tồn tại.
 */
@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final AccountRepository accountRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;

    public CartService(CartRepository cartRepository, AccountRepository accountRepository,
                       CartItemRepository cartItemRepository, ProductVariantRepository productVariantRepository) {
        this.cartRepository = cartRepository;
        this.accountRepository = accountRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
    }

    /** Lấy giỏ hàng của user đang đăng nhập. Tự tạo nếu chưa có. */
    @Transactional(Transactional.TxType.SUPPORTS)
    public CartResponse getMyCart() {
        Account account = getCurrentAccount();
        Cart cart = cartRepository.findByAccountIdWithItems(account.getId())
                .orElseGet(() -> createCartForAccount(account));
        return CartMapper.toResponse(cart);
    }

    /**
     * Thêm sản phẩm vào giỏ. Nếu variant đã có → cộng dồn số lượng.
     *
     * @throws InvalidOperationException nếu tồn kho không đủ
     */
    public CartResponse addToCart(AddToCartRequest request) {
        Account account = getCurrentAccount();
        Cart cart = cartRepository.findByAccountIdWithItems(account.getId())
                .orElseGet(() -> createCartForAccount(account));
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId()));

        if (variant.getQuantity() < request.getQuantity())
            throw new InvalidOperationException("Không đủ hàng. Tồn kho: " + variant.getQuantity());

        cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId())
                .ifPresentOrElse(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (newQty > variant.getQuantity())
                        throw new InvalidOperationException("Số lượng vượt tồn kho: " + variant.getQuantity());
                    existing.setQuantity(newQty);
                    cartItemRepository.save(existing);
                }, () -> {
                    CartItem newItem = new CartItem();
                    newItem.setId(UUID.randomUUID().toString());
                    newItem.setCart(cart); newItem.setProductVariant(variant);
                    newItem.setQuantity(request.getQuantity());
                    cartItemRepository.save(newItem);
                });

        return CartMapper.toResponse(cartRepository.findByAccountIdWithItems(account.getId()).orElse(cart));
    }

    /**
     * Cập nhật số lượng item trong giỏ. Nếu quantity <= 0 → xóa item.
     */
    public CartResponse updateCartItem(String cartItemId, int quantity) {
        if (quantity <= 0) return removeCartItem(cartItemId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));
        if (quantity > item.getProductVariant().getQuantity())
            throw new InvalidOperationException("Số lượng vượt tồn kho: " + item.getProductVariant().getQuantity());

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return CartMapper.toResponse(cartRepository.findByAccountIdWithItems(getCurrentAccount().getId()).orElseThrow());
    }

    /** Xóa một item khỏi giỏ hàng. */
    public CartResponse removeCartItem(String cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));
        cartItemRepository.delete(item);
        return CartMapper.toResponse(cartRepository.findByAccountIdWithItems(getCurrentAccount().getId()).orElseThrow());
    }

    /** Xóa toàn bộ item trong giỏ hàng. */
    public void clearCart() {
        Account account = getCurrentAccount();
        cartRepository.findByAccountId(account.getId()).ifPresent(cart -> {
            if (cart.getCartItems() != null) cartItemRepository.deleteAll(cart.getCartItems());
        });
    }

    private Cart createCartForAccount(Account account) {
        Cart cart = new Cart();
        cart.setId(UUID.randomUUID().toString());
        cart.setAccount(account);
        cart.setCartItems(new ArrayList<>());
        return cartRepository.save(cart);
    }

    private Account getCurrentAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails ud))
            throw new InvalidOperationException("User not authenticated.");
        return accountRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", ud.getUsername()));
    }
}
