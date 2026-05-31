package fit.iuh.order.order.core.strategy;

public interface NotificationStrategy {
    void send(Long userId, String content);
}
