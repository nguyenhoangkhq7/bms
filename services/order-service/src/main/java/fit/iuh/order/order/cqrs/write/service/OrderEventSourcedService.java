package fit.iuh.order.order.cqrs.write.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import fit.iuh.order.exception.BadRequestException;
import fit.iuh.order.exception.NotFoundException;
import fit.iuh.order.checkout.model.CheckoutContext;
import fit.iuh.order.checkout.handler.StockCheckHandler;
import fit.iuh.order.order.core.dto.OrderRequest;
import fit.iuh.order.order.core.dto.OrderResponse;
import fit.iuh.order.order.cqrs.write.aggregate.OrderAggregate;
import fit.iuh.order.order.cqrs.write.event.*;
import fit.iuh.order.order.cqrs.write.model.OrderEventEntity;
import fit.iuh.order.order.cqrs.write.repository.OrderEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderEventSourcedService {

    private final OrderEventRepository orderEventRepository;
    private final StockCheckHandler stockCheckHandler;
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        CheckoutContext context = CheckoutContext.builder()
            .userId(request.getUserId())
            .shippingAddressId(request.getShippingAddressId())
            .shippingAddress(request.getShippingAddress())
            .shippingLatitude(request.getShippingLatitude() != null ? request.getShippingLatitude() : 0.0)
            .shippingLongitude(request.getShippingLongitude() != null ? request.getShippingLongitude() : 0.0)
            .voucherCode(request.getVoucherCode())
            .requestedItems(request.getItems())
            .previewOnly(true)
            .build();

        stockCheckHandler.handle(context);

        long numericId = System.currentTimeMillis() + (long) (Math.random() * 1000);
        String aggregateId = String.valueOf(numericId);

        List<EventOrderItem> eventItems = context.getOrderItems().stream()
            .map(item -> new EventOrderItem(
                item.getBookId(),
                item.getQuantity(),
                item.getPriceAtPurchase() != null ? item.getPriceAtPurchase().doubleValue() : 0.0
            ))
            .collect(Collectors.toList());

        String eventId = UUID.randomUUID().toString();
        OrderCreatedEvent event = new OrderCreatedEvent(
            eventId,
            aggregateId,
            1,
            LocalDateTime.now(),
            request.getUserId(),
            "ORD-" + numericId,
            eventItems,
            context.getFinalTotal() != null ? context.getFinalTotal().doubleValue() : 0.0,
            request.getShippingAddress()
        );

        saveEvent(event);

        return OrderResponse.builder()
            .id(numericId)
            .userId(request.getUserId())
            .orderDate(LocalDateTime.now())
            .subtotalAmount(context.getSubtotal())
            .baseShippingFee(context.getBaseShippingFee())
            .shippingDiscount(context.getShippingDiscount())
            .orderDiscount(context.getOrderDiscount())
            .finalTotal(context.getFinalTotal())
            .totalAmount(context.getFinalTotal())
            .status("PENDING")
            .shippingAddress(request.getShippingAddress())
            .build();
    }

    @Transactional
    public void settlePayment(String orderId, String transactionId) {
        List<BaseEvent> history = getHistory(orderId);
        if (history.isEmpty()) {
            throw new NotFoundException("Order history not found for id: " + orderId);
        }

        OrderAggregate aggregate = OrderAggregate.recreateFromHistory(history);
        if (aggregate.getStatus() != fit.iuh.order.order.core.model.OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in PENDING state. Current status: " + aggregate.getStatus());
        }

        String eventId = UUID.randomUUID().toString();
        PaymentSettledEvent event = new PaymentSettledEvent(
            eventId,
            orderId,
            aggregate.getVersion() + 1,
            LocalDateTime.now(),
            transactionId
        );

        saveEvent(event);
    }

    @Transactional
    public void cancelOrderTimeout(String orderId) {
        List<BaseEvent> history = getHistory(orderId);
        if (history.isEmpty()) {
            return;
        }

        OrderAggregate aggregate = OrderAggregate.recreateFromHistory(history);
        if (aggregate.getStatus() == fit.iuh.order.order.core.model.OrderStatus.PENDING) {
            String eventId = UUID.randomUUID().toString();
            OrderCancelledEvent event = new OrderCancelledEvent(
                eventId,
                orderId,
                aggregate.getVersion() + 1,
                LocalDateTime.now(),
                "Timeout cancellation"
            );

            saveEvent(event);
        }
    }

    public List<BaseEvent> getHistory(String aggregateId) {
        List<OrderEventEntity> entities = orderEventRepository.findByAggregateIdOrderByVersionAsc(aggregateId);
        List<BaseEvent> events = new ArrayList<>();
        for (OrderEventEntity entity : entities) {
            events.add(deserializeEvent(entity.getEventData(), entity.getEventType()));
        }
        return events;
    }

    private void saveEvent(BaseEvent event) {
        OrderEventEntity entity = OrderEventEntity.builder()
            .eventId(event.getEventId())
            .aggregateId(event.getAggregateId())
            .eventType(event.getClass().getSimpleName())
            .eventData(serializeEvent(event))
            .version(event.getVersion())
            .createdAt(event.getCreatedAt())
            .build();
        orderEventRepository.save(entity);

        if (rabbitTemplate != null) {
            try {
                String message = event.getClass().getSimpleName() + "#" + serializeEvent(event);
                rabbitTemplate.convertAndSend("order-events-exchange", "order.event", message);
            } catch (Exception e) {
                System.err.println("Failed to publish event to RabbitMQ: " + e.getMessage());
            }
        }
    }

    private String serializeEvent(BaseEvent event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize event", e);
        }
    }

    private BaseEvent deserializeEvent(String data, String eventType) {
        try {
            Class<?> clazz = Class.forName("fit.iuh.order.order.cqrs.write.event." + eventType);
            return (BaseEvent) objectMapper.readValue(data, clazz);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize event of type " + eventType, e);
        }
    }
}
