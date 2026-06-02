package fit.iuh.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ReportRabbitConfig {

    public static final String EXCHANGE_NAME = "order.events.exchange";
    public static final String QUEUE_NAME = "report.order-completed.queue";
    public static final String ROUTING_KEY = "order.completed";

    @Bean
    public TopicExchange orderReportEventsExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE_NAME)
                .durable(true)
                .build();
    }

    @Bean
    public Queue reportOrderCompletedQueue() {
        return QueueBuilder.durable(QUEUE_NAME)
                .build();
    }

    @Bean
    public Binding bindingReportOrderCompleted() {
        return BindingBuilder.bind(reportOrderCompletedQueue())
                .to(orderReportEventsExchange())
                .with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.findAndRegisterModules();
        
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter(objectMapper);
        
        DefaultClassMapper classMapper = new DefaultClassMapper();
        classMapper.setTrustedPackages("*");
        
        Map<String, Class<?>> idClassMapping = new HashMap<>();
        idClassMapping.put("fit.iuh.order.messaging.OrderCompletedEvent", fit.iuh.dto.OrderCompletedEvent.class);
        classMapper.setIdClassMapping(idClassMapping);
        
        converter.setClassMapper(classMapper);
        
        return converter;
    }
}
