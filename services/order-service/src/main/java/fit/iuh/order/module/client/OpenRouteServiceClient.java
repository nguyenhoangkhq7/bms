package fit.iuh.order.module.client;

import org.springframework.stereotype.Component;

@Component
public class OpenRouteServiceClient implements RoutingClient {
    @Override
    public Double calculateDistance(Double destLat, Double destLng) {
        // Placeholder until real routing API is integrated.
        return 0.0d;
    }
}
