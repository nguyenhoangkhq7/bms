package fit.iuh.order.module.handler;

import fit.iuh.order.module.order_management.dto.OrderItemRequest;
import fit.iuh.order.module.models.Order;
import fit.iuh.order.module.models.OrderItem;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutContext {
    private Long userId;
    private String shippingAddress;
    private Double shippingLatitude;
    private Double shippingLongitude;
    private String voucherCode;
    private List<OrderItemRequest> requestedItems;
    private Boolean previewOnly;
    private Long cartId;
    private List<OrderItem> orderItems;
    private BigDecimal subtotal;
    private BigDecimal baseShippingFee;
    private BigDecimal shippingDiscount;
    private BigDecimal orderDiscount;
    private BigDecimal finalTotal;
    private Order order;
}
