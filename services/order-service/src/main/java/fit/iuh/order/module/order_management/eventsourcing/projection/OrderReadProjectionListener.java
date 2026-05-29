package fit.iuh.order.module.order_management.eventsourcing.projection;

import com.fasterxml.jackson.databind.ObjectMapper;
import fit.iuh.order.module.order_management.eventsourcing.events.*;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderReadProjectionListener {

    private final OrderReadViewRepository orderReadViewRepository;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "order-events-queue")
    public void receiveOrderEvent(String message) {
        System.out.println("Received order event message: " + message);
        try {
            int delimiterIdx = message.indexOf('#');
            if (delimiterIdx == -1) {
                return;
            }
            String eventType = message.substring(0, delimiterIdx);
            String eventData = message.substring(delimiterIdx + 1);

            Class<?> clazz = Class.forName("fit.iuh.order.module.order_management.eventsourcing.events." + eventType);
            BaseEvent event = (BaseEvent) objectMapper.readValue(eventData, clazz);

            if (event instanceof OrderCreatedEvent e) {
                String itemsJson = objectMapper.writeValueAsString(e.getItems());
                OrderReadView view = OrderReadView.builder()
                    .id(e.getAggregateId())
                    .userId(e.getUserId())
                    .orderCode(e.getOrderCode())
                    .totalAmount(e.getTotalPrice())
                    .status("PENDING")
                    .shippingAddress(e.getShippingAddress())
                    .itemsJson(itemsJson)
                    .createdAt(e.getCreatedAt())
                    .updatedAt(e.getCreatedAt())
                    .build();
                orderReadViewRepository.save(view);
            } else if (event instanceof PaymentSettledEvent e) {
                orderReadViewRepository.findById(e.getAggregateId()).ifPresent(view -> {
                    view.setStatus("COMPLETED");
                    view.setTransactionId(e.getTransactionId());
                    view.setUpdatedAt(e.getCreatedAt());
                    orderReadViewRepository.save(view);
                });
            } else if (event instanceof OrderCancelledEvent e) {
                orderReadViewRepository.findById(e.getAggregateId()).ifPresent(view -> {
                    view.setStatus("CANCELED");
                    view.setUpdatedAt(e.getCreatedAt());
                    orderReadViewRepository.save(view);
                });
            }
        } catch (Exception e) {
            System.err.println("Error processing projected event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
