package fit.iuh.order.messaging;

import org.springframework.stereotype.Component;

@Component
public class OrderTimeoutListener {
    public void handleOrderTimeout(Long orderId) {
        // Placeholder for timeout event consumption.
    }
}
