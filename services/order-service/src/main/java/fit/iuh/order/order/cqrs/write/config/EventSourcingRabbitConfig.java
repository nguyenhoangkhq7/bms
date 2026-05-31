package fit.iuh.order.order.cqrs.write.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EventSourcingRabbitConfig {

    @Bean
    public DirectExchange orderEventsExchange() {
        return new DirectExchange("order-events-exchange", true, false);
    }

    @Bean
    public Queue orderEventsQueue() {
        return new Queue("order-events-queue", true);
    }

    @Bean
    public Binding orderEventsBinding(
            @org.springframework.beans.factory.annotation.Qualifier("orderEventsQueue") Queue orderEventsQueue, 
            DirectExchange orderEventsExchange) {
        return BindingBuilder.bind(orderEventsQueue).to(orderEventsExchange).with("order.event");
    }
}
