package fit.iuh.order.module.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import fit.iuh.order.module.models.Cart;
import fit.iuh.order.module.models.CartItem;
import fit.iuh.order.module.dto.AddCartItemRequest;
import fit.iuh.order.module.dto.CartResponse;
import fit.iuh.order.module.dto.RemoveCartItemRequest;
import fit.iuh.order.module.dto.UpdateCartItemQuantityRequest;
import fit.iuh.order.module.exception.BadRequestException;
import fit.iuh.order.module.repository.CartItemRepository;
import fit.iuh.order.module.repository.CartRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {
    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void addProduct_shouldIncreaseQuantity_whenBookExists() {
        Cart cart = Cart.builder().id(1L).userId(10L).totalEstimated(BigDecimal.ZERO).build();
        CartItem item = CartItem.builder().id(2L).cartId(1L).bookId(100L).quantity(2).build();

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(1L, 100L)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByCartId(1L)).thenReturn(List.of(item));

        CartResponse response = cartService.addProduct(new AddCartItemRequest(10L, 100L, 3));

        assertEquals(5, response.items().getFirst().quantity());
    }

    @Test
    void removeProduct_shouldDeleteOrDecreaseBasedOnQuantity() {
        Cart cart = Cart.builder().id(1L).userId(10L).totalEstimated(BigDecimal.ZERO).build();
        CartItem item = CartItem.builder().id(2L).cartId(1L).bookId(100L).quantity(4).build();

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(1L, 100L)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByCartId(1L)).thenReturn(List.of(item));

        CartResponse response = cartService.removeProduct(new RemoveCartItemRequest(10L, 100L, 2));

        assertEquals(2, response.items().getFirst().quantity());
    }

    @Test
    void removeProduct_shouldThrowBadRequest_whenRemovingTooMuch() {
        Cart cart = Cart.builder().id(1L).userId(10L).totalEstimated(BigDecimal.ZERO).build();
        CartItem item = CartItem.builder().id(2L).cartId(1L).bookId(100L).quantity(1).build();

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(1L, 100L)).thenReturn(Optional.of(item));

        assertThrows(BadRequestException.class,
            () -> cartService.removeProduct(new RemoveCartItemRequest(10L, 100L, 2)));
    }

    @Test
    void updateProductQuantity_shouldUpdateQuantitySuccessfully() {
        Cart cart = Cart.builder().id(1L).userId(10L).totalEstimated(BigDecimal.ZERO).build();
        CartItem item = CartItem.builder().id(2L).cartId(1L).bookId(100L).quantity(2).build();

        when(cartRepository.findByUserId(10L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndBookId(1L, 100L)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByCartId(1L)).thenReturn(List.of(item));

        CartResponse response = cartService.updateProductQuantity(new UpdateCartItemQuantityRequest(10L, 100L, 5));

        assertEquals(5, response.items().getFirst().quantity());
    }
}
