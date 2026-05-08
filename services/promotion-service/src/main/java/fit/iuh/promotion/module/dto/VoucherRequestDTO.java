package fit.iuh.promotion.module.dto;

import fit.iuh.promotion.module.domain.enums.DiscountType;
import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherRequestDTO {
    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount amount is required")
    @DecimalMin(value = "0.01", message = "Discount amount must be greater than 0")
    private BigDecimal discountAmount;

    @DecimalMin(value = "0.00", message = "Maximum discount must not be negative")
    private BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0.00", message = "Minimum order value must not be negative")
    private BigDecimal minOrderValue;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer usageLimit;

    private VoucherStatus status;

    private String description;
}
