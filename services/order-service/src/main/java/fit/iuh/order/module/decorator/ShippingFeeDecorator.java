package fit.iuh.order.module.decorator;

import fit.iuh.order.module.client.RoutingClient;
import fit.iuh.order.module.exception.NotFoundException;
import fit.iuh.order.module.models.ShippingRule;
import fit.iuh.order.module.shipping.repository.ShippingRuleRepository;
import java.math.BigDecimal;

public class ShippingFeeDecorator extends PriceDecorator {
    private final RoutingClient routingClient;
    private final ShippingRuleRepository shippingRuleRepository;
    private final Double destinationLatitude;
    private final Double destinationLongitude;
    private BigDecimal cachedBaseShippingFee;

    public ShippingFeeDecorator(
        OrderPrice wrapped,
        RoutingClient routingClient,
        ShippingRuleRepository shippingRuleRepository,
        Double destinationLatitude,
        Double destinationLongitude
    ) {
        super(wrapped);
        this.routingClient = routingClient;
        this.shippingRuleRepository = shippingRuleRepository;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
    }

    @Override
    public BigDecimal getBaseShippingFee() {
        if (cachedBaseShippingFee != null) {
            return cachedBaseShippingFee;
        }

        if (destinationLatitude == null || destinationLongitude == null) {
            cachedBaseShippingFee = BigDecimal.ZERO;
            return cachedBaseShippingFee;
        }

        Double distanceInKm = routingClient.calculateDistance(destinationLatitude, destinationLongitude);
        ShippingRule rule = shippingRuleRepository.findMatchingRule(distanceInKm)
            .orElseThrow(() -> new NotFoundException("No shipping rule for distance " + distanceInKm));

        cachedBaseShippingFee = rule.getFee();
        return cachedBaseShippingFee;
    }

    @Override
    public BigDecimal getFinalTotal() {
        return wrapped.getFinalTotal().add(getBaseShippingFee());
    }
}
