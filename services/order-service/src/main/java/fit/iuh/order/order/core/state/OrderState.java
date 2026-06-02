package fit.iuh.order.order.core.state;

import fit.iuh.order.order.core.model.Order;

public interface OrderState {
    void process(Order order);

    void cancel(Order order);
}
