package fit.iuh.order.module.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fit.iuh.order.module.models.StoreInfo;
import fit.iuh.order.module.shipping.repository.StoreInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class OpenRouteServiceClient implements RoutingClient {
    private final WebClient.Builder webClientBuilder;
    private final StoreInfoRepository storeInfoRepository;
    private final ObjectMapper objectMapper;

    @Value("${external.openrouteservice.base-url:https://api.openrouteservice.org}")
    private String baseUrl;

    @Value("${external.openrouteservice.api-key:}")
    private String apiKey;

    @Value("${shipping.default-store-latitude:10.822159}")
    private Double defaultStoreLat;

    @Value("${shipping.default-store-longitude:106.686824}")
    private Double defaultStoreLng;

    @Override
    public Double calculateDistance(Double destLat, Double destLng) {
        StoreInfo storeInfo = storeInfoRepository.findTopByOrderByIdAsc().orElse(null);
        Double storeLat = storeInfo != null ? storeInfo.getLatitude() : defaultStoreLat;
        Double storeLng = storeInfo != null ? storeInfo.getLongitude() : defaultStoreLng;

        if (apiKey == null || apiKey.isBlank()) {
            return haversineKm(storeLat, storeLng, destLat, destLng);
        }

        String uri = String.format(
            "%s/v2/directions/driving-car?start=%s,%s&end=%s,%s",
            baseUrl,
            storeLng,
            storeLat,
            destLng,
            destLat
        );

        String response = webClientBuilder.build()
            .get()
            .uri(uri)
            .header("Authorization", apiKey)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        if (response == null || response.isBlank()) {
            return haversineKm(storeLat, storeLng, destLat, destLng);
        }

        try {
            JsonNode root = objectMapper.readTree(response);
            double meters = root.path("features")
                .path(0)
                .path("properties")
                .path("summary")
                .path("distance")
                .asDouble();
            return meters / 1000d;
        } catch (Exception ex) {
            return haversineKm(storeLat, storeLng, destLat, destLng);
        }
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371d;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1))
            * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }
}
