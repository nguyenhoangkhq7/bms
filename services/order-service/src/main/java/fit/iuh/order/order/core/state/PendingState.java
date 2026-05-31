package fit.iuh.order.order.core.state;

import fit.iuh.order.order.core.model.Order;
import fit.iuh.order.order.core.model.OrderStatus;

public class PendingState implements OrderState {
    @Override
    public void process(Order order) {
        order.setStatus(OrderStatus.CONFIRMED);
    }

    @Override
    public void cancel(Order order) {
        order.setStatus(OrderStatus.CANCELED);
    }
}
