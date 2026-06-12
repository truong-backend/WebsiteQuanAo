package com.example.fashionstore.service.cart;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.cart.AddToCartRequest;
import com.example.fashionstore.dto.cart.CartDto;
import com.example.fashionstore.module.cart.Cart;
import com.example.fashionstore.module.cart.CartItem;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.cart.CartRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository           cartRepository;
    private final ProductVariantRepository variantRepository;

    // ── Get Cart ────────────────────────────────────────────────────

    @Transactional(Transactional.TxType.SUPPORTS)
    public CartDto getMyCart() {
        User user = SecurityUtils.getCurrentUser();
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createEmptyCart(user));
        return toDto(cart);
    }

    // ── Add / Update item ────────────────────────────────────────────

    public CartDto addToCart(AddToCartRequest req) {
        User user = SecurityUtils.getCurrentUser();
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createEmptyCart(user));

        ProductVariant variant = variantRepository.findById(req.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", req.getVariantId()));

        if (!variant.getProduct().isActive())
            throw new BusinessException("Sản phẩm này không còn bán");

        if (variant.getQuantity() < req.getQuantity())
            throw new BusinessException("Sản phẩm chỉ còn " + variant.getQuantity() + " cái");

        // Check if item already exists
        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(req.getVariantId()))
                .findFirst().orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + req.getQuantity();
            if (newQty > variant.getQuantity())
                throw new BusinessException("Tổng số lượng vượt quá tồn kho (" + variant.getQuantity() + " cái)");
            existing.setQuantity(newQty);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(req.getQuantity())
                    .build();
            cart.getItems().add(item);
        }

        return toDto(cartRepository.save(cart));
    }

    public CartDto updateItem(Long cartItemId, int quantity) {
        User user = SecurityUtils.getCurrentUser();
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new BusinessException("Giỏ hàng trống"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (quantity > item.getVariant().getQuantity())
                throw new BusinessException("Chỉ còn " + item.getVariant().getQuantity() + " cái");
            item.setQuantity(quantity);
        }

        return toDto(cartRepository.save(cart));
    }

    public CartDto removeItem(Long cartItemId) {
        return updateItem(cartItemId, 0);
    }

    public CartDto clearCart() {
        User user = SecurityUtils.getCurrentUser();
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createEmptyCart(user));
        cart.getItems().clear();
        return toDto(cartRepository.save(cart));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private Cart createEmptyCart(User user) {
        Cart cart = Cart.builder().user(user).build();
        return cartRepository.save(cart);
    }

    private CartDto toDto(Cart cart) {
        List<CartDto.CartItemDto> itemDtos = cart.getItems().stream()
                .map(item -> {
                    ProductVariant v = item.getVariant();
                    var product = v.getProduct();
                    BigDecimal price = product.getEffectivePrice();
                    return CartDto.CartItemDto.builder()
                            .cartItemId(item.getId())
                            .variantId(v.getId())
                            .sku(v.getSku())
                            .productId(product.getId())
                            .productName(product.getName())
                            .productSlug(product.getSlug())
                            .colorCode(v.getColorCode())
                            .colorName(v.getColorName())
                            .sizeCode(v.getSizeCode())
                            .imageUrl(v.getImageUrl() != null ? v.getImageUrl() : product.getMainImage())
                            .unitPrice(price)
                            .quantity(item.getQuantity())
                            .stockQuantity(v.getQuantity())
                            .lineTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build();
                }).toList();

        BigDecimal subtotal = itemDtos.stream()
                .map(CartDto.CartItemDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.builder()
                .cartId(cart.getId())
                .totalItems(itemDtos.stream().mapToInt(CartDto.CartItemDto::getQuantity).sum())
                .subtotal(subtotal)
                .items(itemDtos)
                .build();
    }
}