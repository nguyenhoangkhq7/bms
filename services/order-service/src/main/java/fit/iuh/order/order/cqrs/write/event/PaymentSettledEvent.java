package fit.iuh.order.order.cqrs.write.event;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class PaymentSettledEvent extends BaseEvent {
    private final String transactionId;

    public PaymentSettledEvent(
            String eventId,
            String aggregateId,
            int version,
            LocalDateTime createdAt,
            String transactionId) {
        super(eventId, aggregateId, version, createdAt);
        this.transactionId = transactionId;
    }
}
