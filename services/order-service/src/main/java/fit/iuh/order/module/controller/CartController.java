package fit.iuh.order.module.controller;

import fit.iuh.order.module.dto.AddCartItemRequest;
import fit.iuh.order.module.dto.ApiResponse;
import fit.iuh.order.module.dto.CartResponse;
import fit.iuh.order.module.dto.RemoveCartItemRequest;
import fit.iuh.order.module.dto.UpdateCartItemQuantityRequest;
import fit.iuh.order.module.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @PostMapping("/items/add")
    public ResponseEntity<ApiResponse<CartResponse>> addProduct(@Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>("Add product to cart successfully", cartService.addProduct(request)));
    }

    @PostMapping("/items/remove")
    public ResponseEntity<ApiResponse<CartResponse>> removeProduct(@Valid @RequestBody RemoveCartItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>("Remove product from cart successfully", cartService.removeProduct(request)));
    }

    @PostMapping("/items/update-quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateProductQuantity(@Valid @RequestBody UpdateCartItemQuantityRequest request) {
        return ResponseEntity.ok(new ApiResponse<>("Update product quantity successfully", cartService.updateProductQuantity(request)));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCartByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>("Get cart successfully", cartService.getCartByUserId(userId)));
    }
}
