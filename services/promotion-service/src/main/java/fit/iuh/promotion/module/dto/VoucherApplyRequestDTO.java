package fit.iuh.promotion.module.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VoucherApplyRequestDTO {
    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotNull(message = "Order value is required")
    @DecimalMin(value = "0.00", message = "Order value must not be negative")
    private BigDecimal orderValue;
}
