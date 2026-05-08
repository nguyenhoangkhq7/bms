package fit.iuh.order.module.handler;

import fit.iuh.order.module.cart_management.repository.CartItemRepository;
import fit.iuh.order.module.cart_management.repository.CartRepository;
import fit.iuh.order.module.models.Cart;
import fit.iuh.order.module.models.Order;
import fit.iuh.order.module.models.OrderItem;
import fit.iuh.order.module.models.enums.OrderStatus;
import fit.iuh.order.module.order_management.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PersistOrderHandler extends CheckoutHandler {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    protected void process(CheckoutContext context) {
        if (Boolean.TRUE.equals(context.getPreviewOnly())) {
            return;
        }

        Order order = Order.builder()
            .userId(context.getUserId())
            .orderCode("ORD-" + System.currentTimeMillis())
            .orderDate(LocalDateTime.now())
            .status(OrderStatus.PENDING)
            .shippingAddress(context.getShippingAddress())
            .shippingLatitude(context.getShippingLatitude())
            .shippingLongitude(context.getShippingLongitude())
            .subtotalAmount(valueOrZero(context.getSubtotal()))
            .baseShippingFee(valueOrZero(context.getBaseShippingFee()))
            .shippingDiscount(valueOrZero(context.getShippingDiscount()))
            .orderDiscount(valueOrZero(context.getOrderDiscount()))
            .finalTotal(valueOrZero(context.getFinalTotal()))
            .totalAmount(valueOrZero(context.getFinalTotal()))
            .build();

        List<OrderItem> items = context.getOrderItems();
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(order);
            }
            order.setItems(items);
        }

        Order savedOrder = orderRepository.save(order);
        context.setOrder(savedOrder);

        if (context.getCartId() != null) {
            cartItemRepository.deleteAll(cartItemRepository.findByCartId(context.getCartId()));
            cartRepository.findById(context.getCartId()).ifPresent(cart -> clearCart(cart));
        }
    }

    private void clearCart(Cart cart) {
        cart.setTotalEstimated(BigDecimal.ZERO);
        cartRepository.save(cart);
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
