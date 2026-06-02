package fit.iuh.order.order.cqrs.write.event;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public abstract class BaseEvent {
    private final String eventId;
    private final String aggregateId;
    private final int version;
    private final LocalDateTime createdAt;

    protected BaseEvent(String eventId, String aggregateId, int version, LocalDateTime createdAt) {
        this.eventId = eventId;
        this.aggregateId = aggregateId;
        this.version = version;
        this.createdAt = createdAt;
    }
}
