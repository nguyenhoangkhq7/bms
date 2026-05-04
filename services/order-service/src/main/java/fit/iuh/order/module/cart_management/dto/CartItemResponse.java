package fit.iuh.order.module.cart_management.dto;

public record CartItemResponse(
    Long id,
    Long cartId,
    Long bookId,
    int quantity
) {
}
