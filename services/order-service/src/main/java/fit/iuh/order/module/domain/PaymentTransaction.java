package fit.iuh.order.module.domain;

import fit.iuh.order.module.domain.enums.PaymentStatus;
import fit.iuh.order.module.strategy.PaymentStrategy;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {
    @Id
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Transient
    private PaymentStrategy strategy;

    public void executePayment() {
        if (strategy == null) {
            throw new IllegalStateException("Payment strategy must be set before execution");
        }
        strategy.pay(amount);
    }
}
