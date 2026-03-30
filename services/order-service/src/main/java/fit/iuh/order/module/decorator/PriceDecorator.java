package fit.iuh.order.module.decorator;

import java.math.BigDecimal;

public abstract class PriceDecorator implements OrderPrice {
    protected final OrderPrice wrapped;

    protected PriceDecorator(OrderPrice wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public BigDecimal calculate() {
        return wrapped.calculate();
    }
}
