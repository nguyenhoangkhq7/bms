package fit.iuh.order.module.messaging;

import org.springframework.stereotype.Component;

@Component
public class OrderTimeoutListener {
    public void handleOrderTimeout(Long orderId) {
        // Placeholder for timeout event consumption.
    }
}
