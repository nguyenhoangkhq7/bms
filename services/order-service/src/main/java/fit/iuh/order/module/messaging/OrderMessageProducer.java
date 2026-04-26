package fit.iuh.order.module.messaging;

import org.springframework.stereotype.Component;

@Component
public class OrderMessageProducer {
    public void sendOrderCompletedEvent(Long orderId) {
        // Placeholder for publishing order-completed event.
    }
}
