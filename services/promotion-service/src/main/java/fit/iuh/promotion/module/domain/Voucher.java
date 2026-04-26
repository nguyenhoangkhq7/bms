package fit.iuh.promotion.module.domain;

import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

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
    private String code; // Ví dụ: KM2026

    private BigDecimal discountAmount; // Số tiền giảm hoặc %

    private BigDecimal minOrderValue; // Giá trị đơn hàng tối thiểu

    @Enumerated(EnumType.STRING)
    private VoucherStatus status;

    private String description; // AI sẽ dùng trường này để hiểu mục đích voucher
}