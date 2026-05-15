package fit.iuh.order.module.shipping_address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressResponse {
    private Long id;
    private Long userId;
    private String recipientName;
    private String phoneNumber;
    private String addressLine;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
}
