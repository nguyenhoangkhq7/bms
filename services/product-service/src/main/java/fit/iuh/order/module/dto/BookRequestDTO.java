package fit.iuh.order.module.dto;


import fit.iuh.order.module.domain.enums.BookStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookRequestDTO {
    private String title;
    private String sku;
    private BigDecimal price;
    private int stockQuantity;
    private BookStatus status;
    private String imageUrl;
    private Long categoryId; // Chú ý: Chỉ nhận ID của category, không nhận cả object
}
