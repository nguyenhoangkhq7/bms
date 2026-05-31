package fit.iuh.order.order.cqrs.write.event;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class OrderCancelledEvent extends BaseEvent {
    private final String reason;

    public OrderCancelledEvent(
            String eventId,
            String aggregateId,
            int version,
            LocalDateTime createdAt,
            String reason) {
        super(eventId, aggregateId, version, createdAt);
        this.reason = reason;
    }
}
