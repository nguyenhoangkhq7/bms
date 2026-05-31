package fit.iuh.order.order.cqrs.write.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class EventOrderItem {
    private final Long bookId;
    private final int quantity;
    private final double price;
}
