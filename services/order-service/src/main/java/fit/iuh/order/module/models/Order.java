package fit.iuh.order.module.models;

import fit.iuh.order.module.enums.OrderStatus;
import fit.iuh.order.module.state.OrderState;
import fit.iuh.order.module.strategy.NotificationStrategy;
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
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false)
    private String shippingAddress;

    @Column(nullable = false)
    private Double shippingLatitude;

    @Column(nullable = false)
    private Double shippingLongitude;

    @Transient
    private NotificationStrategy notiStrategy;

    public void changeState(OrderState state) {
        state.process(this);
    }

    public void processOrder() {
        if (status == null) {
            status = OrderStatus.PENDING;
        }
    }

    public void notifyUser() {
        if (notiStrategy != null) {
            notiStrategy.send(userId, "Order " + orderCode + " status: " + status);
        }
    }
}
