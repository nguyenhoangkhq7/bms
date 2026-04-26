package fit.iuh.order.module.decorator;

import java.math.BigDecimal;

public class VoucherDecorator extends PriceDecorator {
    private final BigDecimal voucherDiscount;

    public VoucherDecorator(OrderPrice wrapped, BigDecimal voucherDiscount) {
        super(wrapped);
        this.voucherDiscount = voucherDiscount;
    }

    @Override
    public BigDecimal calculate() {
        BigDecimal value = super.calculate().subtract(voucherDiscount);
        return value.max(BigDecimal.ZERO);
    }
}
