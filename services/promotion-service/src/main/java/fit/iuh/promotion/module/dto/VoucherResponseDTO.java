package fit.iuh.promotion.module.dto;

import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherResponseDTO {
    private Long id;
    private String code;
    private String summary; // Kết hợp code và description cho người dùng
    private BigDecimal discountAmount;
    private VoucherStatus status;
}