package fit.iuh.order.module.decorator;

import java.math.BigDecimal;

public class ShippingFeeDecorator extends PriceDecorator {
    private final Double distanceInKm;
    private final BigDecimal feePerKm;

    public ShippingFeeDecorator(OrderPrice wrapped, Double distanceInKm, BigDecimal feePerKm) {
        super(wrapped);
        this.distanceInKm = distanceInKm;
        this.feePerKm = feePerKm;
    }

    @Override
    public BigDecimal calculate() {
        return super.calculate().add(feePerKm.multiply(BigDecimal.valueOf(distanceInKm)));
    }
}
