package fit.iuh.order.module.client.promotion;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class PromotionVoucherResponse {
    private String code;
    private DiscountType discountType;

    @JsonAlias({"discountAmount"})
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private String status;
    private String description;

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }
}
