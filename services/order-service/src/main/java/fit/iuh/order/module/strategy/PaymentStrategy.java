package fit.iuh.order.module.strategy;

import java.math.BigDecimal;

public interface PaymentStrategy {
    void pay(BigDecimal amount);
}
