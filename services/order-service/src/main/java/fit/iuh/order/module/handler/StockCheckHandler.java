package fit.iuh.order.module.handler;

import fit.iuh.order.module.client.RoutingClient;
import org.springframework.stereotype.Component;

@Component
public class StockCheckHandler extends CheckoutHandler {
    public StockCheckHandler(RoutingClient routingClient) {
        super(routingClient);
    }

    @Override
    public void handle(Long cartId) {
        super.handle(cartId);
    }
}
