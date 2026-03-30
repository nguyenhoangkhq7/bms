package fit.iuh.order.module.dto;

public record CartItemResponse(
    Long id,
    Long cartId,
    Long bookId,
    int quantity
) {
}
