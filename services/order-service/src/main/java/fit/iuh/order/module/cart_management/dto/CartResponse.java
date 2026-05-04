package fit.iuh.order.module.cart_management.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
    Long id,
    Long userId,
    BigDecimal totalEstimated,
    List<CartItemResponse> items
) {
}
