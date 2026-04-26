package fit.iuh.order.module.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import fit.iuh.order.module.dto.AddCartItemRequest;
import fit.iuh.order.module.dto.CartItemResponse;
import fit.iuh.order.module.dto.CartResponse;
import fit.iuh.order.module.dto.RemoveCartItemRequest;
import fit.iuh.order.module.dto.UpdateCartItemQuantityRequest;
import fit.iuh.order.module.service.CartService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {
    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    @Test
    void addProduct_shouldReturn200() {
        CartResponse response = new CartResponse(
            1L,
            10L,
            BigDecimal.ZERO,
            List.of(new CartItemResponse(2L, 1L, 100L, 3))
        );
        AddCartItemRequest request = new AddCartItemRequest(10L, 100L, 3);
        when(cartService.addProduct(request)).thenReturn(response);

        var result = cartController.addProduct(request);

        assertEquals(200, result.getStatusCode().value());
        assertNotNull(result.getBody());
        assertEquals("Add product to cart successfully", result.getBody().message());
        assertEquals(10L, result.getBody().data().userId());
    }

    @Test
    void removeProduct_shouldReturn200() {
        CartResponse response = new CartResponse(
            1L,
            10L,
            BigDecimal.ZERO,
            List.of(new CartItemResponse(2L, 1L, 100L, 2))
        );
        RemoveCartItemRequest request = new RemoveCartItemRequest(10L, 100L, 1);
        when(cartService.removeProduct(request)).thenReturn(response);

        var result = cartController.removeProduct(request);

        assertEquals(200, result.getStatusCode().value());
        assertNotNull(result.getBody());
        assertEquals("Remove product from cart successfully", result.getBody().message());
        assertEquals(10L, result.getBody().data().userId());
    }

    @Test
    void updateProductQuantity_shouldReturn200() {
        CartResponse response = new CartResponse(
            1L,
            10L,
            BigDecimal.ZERO,
            List.of(new CartItemResponse(2L, 1L, 100L, 5))
        );
        UpdateCartItemQuantityRequest request = new UpdateCartItemQuantityRequest(10L, 100L, 5);
        when(cartService.updateProductQuantity(request)).thenReturn(response);

        var result = cartController.updateProductQuantity(request);

        assertEquals(200, result.getStatusCode().value());
        assertNotNull(result.getBody());
        assertEquals("Update product quantity successfully", result.getBody().message());
        assertEquals(10L, result.getBody().data().userId());
    }
}
