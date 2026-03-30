package fit.iuh.order.module.decorator;

import java.math.BigDecimal;

public class BaseOrderPrice implements OrderPrice {
    private final BigDecimal baseAmount;

    public BaseOrderPrice(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }

    @Override
    public BigDecimal calculate() {
        return baseAmount;
    }
}
