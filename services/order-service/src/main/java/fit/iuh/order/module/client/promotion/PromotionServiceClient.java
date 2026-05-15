package fit.iuh.order.module.client.promotion;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class PromotionServiceClient implements PromotionClient {
    private final WebClient.Builder webClientBuilder;

    @Value("${external.promotion-service.base-url:http://promotion-service:8084}")
    private String baseUrl;

    @Override
    public Optional<PromotionVoucherResponse> getVoucherByCode(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }

        List<PromotionVoucherResponse> vouchers = webClientBuilder.build()
            .get()
            .uri(baseUrl + "/api/vouchers")
            .retrieve()
            .bodyToFlux(PromotionVoucherResponse.class)
            .collectList()
            .block();

        if (vouchers == null) {
            return Optional.empty();
        }

        return vouchers.stream()
            .filter(voucher -> code.equalsIgnoreCase(voucher.getCode()))
            .findFirst();
    }
}
