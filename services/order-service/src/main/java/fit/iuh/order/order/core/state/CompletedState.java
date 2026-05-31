package fit.iuh.order.order.core.state;

import fit.iuh.order.order.core.model.Order;

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
