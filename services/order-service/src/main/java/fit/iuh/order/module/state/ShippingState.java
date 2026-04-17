package fit.iuh.order.module.state;

import fit.iuh.order.module.models.Order;
import fit.iuh.order.module.models.OrderStatus;

public class ShippingState implements OrderState {
    @Override
    public void process(Order order) {
        order.setStatus(OrderStatus.COMPLETED);
    }

    @Override
    public void cancel(Order order) {
        order.setStatus(OrderStatus.CANCELED);
    }
}
