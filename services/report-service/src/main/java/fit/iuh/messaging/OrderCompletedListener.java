package fit.iuh.messaging;

import com.rabbitmq.client.Channel;
import fit.iuh.dto.OrderCompletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class OrderCompletedListener {

    @RabbitListener(queues = "report.order-completed.queue", ackMode = "MANUAL")
    public void consumeOrderCompletedEvent(
            OrderCompletedEvent event, 
            Channel channel, 
            @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
        
        log.info("Received OrderCompletedEvent from RabbitMQ: Order ID #{}", event.orderId());
        
        try {
            // Thực hiện xử lý tổng hợp dữ liệu báo cáo / lưu database
            log.info("Aggregating sales stats for Book items: count={}", event.items().size());
            
            // Xác nhận xử lý thành công (ACK) để RabbitMQ xóa tin nhắn khỏi hàng đợi
            channel.basicAck(tag, false);
            log.info("Successfully processed and ACKed message tag: {}", tag);

        } catch (Exception e) {
            log.error("Failed to process OrderCompletedEvent for Order #{}. Rejecting message.", event.orderId(), e);
            
            // Reject message và gửi đến DLX (hoặc drop nếu requeue = false)
            channel.basicReject(tag, false);
        }
    }
}
