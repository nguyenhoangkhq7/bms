package fit.iuh.order.cron;

import fit.iuh.order.order.cqrs.read.model.OrderReadView;
import fit.iuh.order.order.cqrs.read.repository.OrderReadViewRepository;
import fit.iuh.order.order.cqrs.write.service.OrderEventSourcedService;
import fit.iuh.order.order.core.model.Order;
import fit.iuh.order.order.core.model.OrderStatus;
import fit.iuh.order.order.core.model.PaymentStatus;
import fit.iuh.order.order.core.repository.OrderRepository;
import fit.iuh.order.payment.model.PaymentTransaction;
import fit.iuh.order.payment.repository.PaymentTransactionRepository;
import fit.iuh.order.payment.controller.PaymentController;
import fit.iuh.order.payment.strategy.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class PaymentReconciliationScheduler {

    @Autowired
    private OrderReadViewRepository orderReadViewRepository;

    @Autowired
    private OrderEventSourcedService orderEventSourcedService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private PaymentController paymentController;

    @Autowired
    @Qualifier("payOSPaymentStrategy")
    private PaymentStrategy payOSPaymentStrategy;

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void reconcilePayments() {
        log.info("Starting automatic payment reconciliation scheduler job...");
        
        // Find stuck orders: AWAITING_PAYMENT and created > 15 minutes ago
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<OrderReadView> stuckOrders = orderReadViewRepository.findByStatusAndCreatedAtBefore("AWAITING_PAYMENT", cutoff);
        
        log.info("Found {} stuck pending orders to check.", stuckOrders.size());
        
        for (OrderReadView view : stuckOrders) {
            String orderIdStr = view.getId();
            try {
                Long orderId = Long.parseLong(orderIdStr);
                
                // Check if it is a PayOS order (has an active transaction in paymentTransactionRepository)
                boolean isPayOS = paymentTransactionRepository.existsByIdAndIsDeletedFalse(orderId);
                
                if (isPayOS) {
                    log.info("Reconciling PayOS payment for stuck Order ID: {}", orderId);
                    String payStatus = payOSPaymentStrategy.verifyPaymentStatus(orderIdStr);
                    
                    if ("PAID".equalsIgnoreCase(payStatus)) {
                        log.info("Reconciliation SUCCESS: Order ID {} is confirmed PAID by PayOS. Settling order.", orderId);
                        
                        // 1. Update CQRS write model
                        orderEventSourcedService.settlePayment(orderIdStr, "RECONCILED-" + System.currentTimeMillis());
                        
                        // 2. Update JPA transaction
                        PaymentTransaction transaction = paymentTransactionRepository.findByIdAndIsDeletedFalse(orderId).orElse(null);
                        if (transaction != null) {
                            transaction.setStatus(PaymentStatus.PAID);
                            paymentTransactionRepository.save(transaction);
                        }
                        
                        // 3. Notify via SSE
                        if (paymentController != null) {
                            paymentController.sendSseNotification(orderId, "PAID");
                        }
                        
                    } else if ("FAILED".equalsIgnoreCase(payStatus)) {
                        log.info("Reconciliation EXPIRED/CANCELLED: Order ID {} has failed on PayOS. Cancelling order.", orderId);
                        
                        // 1. Update CQRS write model
                        orderEventSourcedService.cancelOrderTimeout(orderIdStr);
                        
                        // 2. Update standard JPA order
                        Order order = orderRepository.findById(orderId).orElse(null);
                        if (order != null) {
                            order.setStatus(OrderStatus.CANCELED);
                            orderRepository.save(order);
                        }
                        
                        // 3. Notify via SSE
                        if (paymentController != null) {
                            paymentController.sendSseNotification(orderId, "CANCELED");
                        }
                    } else {
                        log.info("Reconciliation PENDING: Order ID {} is still unpaid on PayOS.", orderId);
                    }
                } else {
                    log.info("Order ID {} is not a PayOS order. Skipping reconciliation.", orderId);
                }
            } catch (Exception e) {
                log.error("Error reconciling payment for Order ID {}: {}", orderIdStr, e.getMessage(), e);
            }
        }
        
        log.info("Payment reconciliation scheduler job completed successfully.");
    }
}
