package fit.iuh.promotion.module.dto;

import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherRequestDTO {
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal minOrderValue;
    private VoucherStatus status;
    private String description;
}