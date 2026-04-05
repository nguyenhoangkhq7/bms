package fit.iuh.order.module.dto;


import fit.iuh.order.module.domain.enums.BookStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookResponseDTO {
    private Long id;
    private String title;
    private String sku;
    private BigDecimal price;
    private int stockQuantity;
    private BookStatus status;
    private String imageUrl;
    private String categoryName; // Trả về Tên của danh mục cho Frontend dễ hiển thị
}
