package fit.iuh.order.module.state;

import fit.iuh.order.module.domain.Order;

public class CompletedState implements OrderState {
    @Override
    public void process(Order order) {
        // Completed state is terminal in current flow.
    }

    @Override
    public void cancel(Order order) {
        throw new IllegalStateException("Cannot cancel an already completed order");
    }
}
