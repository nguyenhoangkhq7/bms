package fit.iuh.promotion.module.domain;

import fit.iuh.promotion.module.domain.enums.DiscountType;
import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private BigDecimal discountAmount;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minOrderValue;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer usageLimit;

    private Integer usedCount;

    @Enumerated(EnumType.STRING)
    private VoucherStatus status;

    private String description;
}
