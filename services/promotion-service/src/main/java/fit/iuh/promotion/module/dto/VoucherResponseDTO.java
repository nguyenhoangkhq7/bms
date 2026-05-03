package fit.iuh.promotion.module.dto;

import fit.iuh.promotion.module.domain.enums.DiscountType;
import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherResponseDTO {
    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountAmount;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer usageLimit;
    private Integer usedCount;
    private VoucherStatus status;
    private String description;
}
