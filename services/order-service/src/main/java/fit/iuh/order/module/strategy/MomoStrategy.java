package fit.iuh.order.module.strategy;

import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class MomoStrategy implements PaymentStrategy {
    @Override
    public void pay(BigDecimal amount) {
        // Placeholder for Momo integration.
    }
}
