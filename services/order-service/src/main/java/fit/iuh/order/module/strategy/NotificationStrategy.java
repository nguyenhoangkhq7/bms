package fit.iuh.order.module.strategy;

public interface NotificationStrategy {
    void send(Long userId, String content);
}
