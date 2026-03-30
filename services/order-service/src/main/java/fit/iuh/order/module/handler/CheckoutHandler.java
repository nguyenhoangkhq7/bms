package fit.iuh.order.module.handler;

import fit.iuh.order.module.client.RoutingClient;

public abstract class CheckoutHandler {
    protected CheckoutHandler nextHandler;
    protected final RoutingClient routingClient;

    protected CheckoutHandler(RoutingClient routingClient) {
        this.routingClient = routingClient;
    }

    public CheckoutHandler setNextHandler(CheckoutHandler nextHandler) {
        this.nextHandler = nextHandler;
        return nextHandler;
    }

    public void handle(Long cartId) {
        if (nextHandler != null) {
            nextHandler.handle(cartId);
        }
    }
}
