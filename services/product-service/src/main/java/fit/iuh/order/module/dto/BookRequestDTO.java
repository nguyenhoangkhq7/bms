package fit.iuh.order.module.dto;


import fit.iuh.order.module.domain.enums.BookStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BookRequestDTO {
    private String title;
    private String author;
    private String publisher;
    private BigDecimal price;
    private int stockQuantity;
    private BookStatus status;
    private String imageUrl;
    private String description;
    private Long categoryId; // Chú ý: Chỉ nhận ID của category, không nhận cả object
    private List<String> secondaryImageUrls;
}
