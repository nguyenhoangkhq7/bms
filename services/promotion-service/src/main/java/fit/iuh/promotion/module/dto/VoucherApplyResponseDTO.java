package fit.iuh.promotion.module.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class VoucherApplyResponseDTO {
    private String code;
    private BigDecimal orderValue;
    private BigDecimal discountValue;
    private BigDecimal payableValue;
    private String message;
}
