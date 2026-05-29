package fit.iuh.order.module.order_management.eventsourcing.projection;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_read_views")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderReadView {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_code", nullable = false)
    private String orderCode;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "shipping_address", columnDefinition = "text")
    private String shippingAddress;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "items_json", columnDefinition = "text")
    private String itemsJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
