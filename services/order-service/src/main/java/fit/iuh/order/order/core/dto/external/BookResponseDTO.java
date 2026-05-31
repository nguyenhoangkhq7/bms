package fit.iuh.order.order.core.dto.external;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookResponseDTO {
    private Long id;
    private String title;
    private BigDecimal price;
    private int stockQuantity;
}
