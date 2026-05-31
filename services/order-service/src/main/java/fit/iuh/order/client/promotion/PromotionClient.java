package fit.iuh.order.client.promotion;

import java.util.Optional;

public interface PromotionClient {
    Optional<PromotionVoucherResponse> getVoucherByCode(String code);
}
