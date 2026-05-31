package fit.iuh.order.order.cqrs.write.aggregate;

import fit.iuh.order.order.core.model.OrderStatus;
import fit.iuh.order.order.cqrs.write.event.BaseEvent;
import fit.iuh.order.order.cqrs.write.event.OrderCancelledEvent;
import fit.iuh.order.order.cqrs.write.event.OrderCreatedEvent;
import fit.iuh.order.order.cqrs.write.event.PaymentSettledEvent;
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
            this.status = OrderStatus.PENDING;
            this.transactionId = e.getTransactionId();
        } else if (event instanceof OrderCancelledEvent e) {
            this.status = OrderStatus.CANCELED;
        }
    }
}
