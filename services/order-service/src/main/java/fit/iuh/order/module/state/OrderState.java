package fit.iuh.order.module.state;

import fit.iuh.order.module.domain.Order;

public interface OrderState {
    void process(Order order);

    void cancel(Order order);
}
