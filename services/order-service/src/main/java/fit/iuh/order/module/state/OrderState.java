package fit.iuh.order.module.state;

import fit.iuh.order.module.models.Order;

public interface OrderState {
    void process(Order order);

    void cancel(Order order);
}
