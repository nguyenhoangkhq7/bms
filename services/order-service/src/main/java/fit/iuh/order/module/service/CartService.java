package fit.iuh.order.module.service;

import fit.iuh.order.module.models.Cart;
import fit.iuh.order.module.models.CartItem;
import fit.iuh.order.module.dto.AddCartItemRequest;
import fit.iuh.order.module.dto.CartItemResponse;
import fit.iuh.order.module.dto.CartResponse;
import fit.iuh.order.module.dto.RemoveCartItemRequest;
import fit.iuh.order.module.dto.UpdateCartItemQuantityRequest;
import fit.iuh.order.module.exception.BadRequestException;
import fit.iuh.order.module.exception.NotFoundException;
import fit.iuh.order.module.repository.CartItemRepository;
import fit.iuh.order.module.repository.CartRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {
    private static final AtomicLong CART_ID = new AtomicLong(1);
    private static final AtomicLong CART_ITEM_ID = new AtomicLong(1);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public CartResponse addProduct(AddCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(request.userId())
            .orElseGet(() -> createCart(request.userId()));

        CartItem item = cartItemRepository.findByCartIdAndBookId(cart.getId(), request.bookId())
            .map(existing -> {
                existing.setQuantity(existing.getQuantity() + request.quantity());
                return existing;
            })
            .orElseGet(() -> CartItem.builder()
                .id(CART_ITEM_ID.getAndIncrement())
                .cartId(cart.getId())
                .bookId(request.bookId())
                .quantity(request.quantity())
                .build());

        cartItemRepository.save(item);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeProduct(RemoveCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(request.userId())
            .orElseThrow(() -> new NotFoundException("Cart not found for userId=" + request.userId()));

        CartItem item = cartItemRepository.findByCartIdAndBookId(cart.getId(), request.bookId())
            .orElseThrow(() -> new NotFoundException("Book not found in cart: bookId=" + request.bookId()));

        if (request.quantity() > item.getQuantity()) {
            throw new BadRequestException("remove quantity exceeds existing quantity");
        }

        int remaining = item.getQuantity() - request.quantity();
        if (remaining <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(remaining);
            cartItemRepository.save(item);
        }

        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateProductQuantity(UpdateCartItemQuantityRequest request) {
        Cart cart = cartRepository.findByUserId(request.userId())
            .orElseThrow(() -> new NotFoundException("Cart not found for userId=" + request.userId()));

        CartItem item = cartItemRepository.findByCartIdAndBookId(cart.getId(), request.bookId())
            .orElseThrow(() -> new NotFoundException("Book not found in cart: bookId=" + request.bookId()));

        item.setQuantity(request.quantity());
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new NotFoundException("Cart not found for userId=" + userId));
        return toResponse(cart);
    }

    private Cart createCart(Long userId) {
        Cart cart = Cart.builder()
            .id(CART_ID.getAndIncrement())
            .userId(userId)
            .totalEstimated(BigDecimal.ZERO)
            .build();
        return cartRepository.save(cart);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cartItemRepository.findByCartId(cart.getId()).stream()
            .sorted(Comparator.comparing(CartItem::getId))
            .map(item -> new CartItemResponse(item.getId(), item.getCartId(), item.getBookId(), item.getQuantity()))
            .toList();

        return new CartResponse(cart.getId(), cart.getUserId(), cart.getTotalEstimated(), items);
    }
}
