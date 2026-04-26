package fit.iuh.order.module.strategy;

import org.springframework.stereotype.Component;

@Component
public class EmailNotiStrategy implements NotificationStrategy {
    @Override
    public void send(Long userId, String content) {
        // Placeholder for email notification integration.
    }
}
