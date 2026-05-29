package fit.iuh.order.module.order_management.eventsourcing.aggregate;

import fit.iuh.order.module.models.enums.OrderStatus;
import fit.iuh.order.module.order_management.eventsourcing.events.BaseEvent;
import fit.iuh.order.module.order_management.eventsourcing.events.OrderCancelledEvent;
import fit.iuh.order.module.order_management.eventsourcing.events.OrderCreatedEvent;
import fit.iuh.order.module.order_management.eventsourcing.events.PaymentSettledEvent;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class OrderAggregate {
    private String id;
    private Long userId;
    private OrderStatus status;
    private double totalPrice;
    private String shippingAddress;
    private String transactionId;
    private int version = 0;

    public static OrderAggregate recreateFromHistory(List<BaseEvent> events) {
        OrderAggregate aggregate = new OrderAggregate();
        for (BaseEvent event : events) {
            aggregate.apply(event);
        }
        return aggregate;
    }

    private void apply(BaseEvent event) {
        this.version = event.getVersion();
        if (event instanceof OrderCreatedEvent e) {
            this.id = e.getAggregateId();
            this.userId = e.getUserId();
            this.status = OrderStatus.PENDING;
            this.totalPrice = e.getTotalPrice();
            this.shippingAddress = e.getShippingAddress();
        } else if (event instanceof PaymentSettledEvent e) {
            this.status = OrderStatus.COMPLETED;
            this.transactionId = e.getTransactionId();
        } else if (event instanceof OrderCancelledEvent e) {
            this.status = OrderStatus.CANCELED;
        }
    }
}
