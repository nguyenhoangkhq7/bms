package fit.iuh.order.module.state;

import fit.iuh.order.module.domain.Order;
import fit.iuh.order.module.domain.enums.OrderStatus;

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
