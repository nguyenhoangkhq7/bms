package fit.iuh.order.module.strategy;

import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class VNPayStrategy implements PaymentStrategy {
    @Override
    public void pay(BigDecimal amount) {
        // Placeholder for VNPay integration.
    }
}
