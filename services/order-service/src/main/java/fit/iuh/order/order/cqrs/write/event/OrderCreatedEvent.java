package fit.iuh.order.order.cqrs.write.event;

import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class OrderCreatedEvent extends BaseEvent {
    private final Long userId;
    private final String orderCode;
    private final List<EventOrderItem> items;
    private final double totalPrice;
    private final String shippingAddress;

    public OrderCreatedEvent(
            String eventId,
            String aggregateId,
            int version,
            LocalDateTime createdAt,
            Long userId,
            String orderCode,
            List<EventOrderItem> items,
            double totalPrice,
            String shippingAddress) {
        super(eventId, aggregateId, version, createdAt);
        this.userId = userId;
        this.orderCode = orderCode;
        this.items = items;
        this.totalPrice = totalPrice;
        this.shippingAddress = shippingAddress;
    }
}
