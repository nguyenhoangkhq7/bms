package fit.iuh.order.module.dto;


import fit.iuh.order.module.domain.enums.BookStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BookResponseDTO {
    private Long id;
    private String title;
    private String author;
    private String publisher;
    private BigDecimal price;
    private int stockQuantity;
    private BookStatus status;
    private String imageUrl;
    private String description;
    private String categoryName; // Trả về Tên của danh mục cho Frontend dễ hiển thị
    private Long parentCategoryId;
    private List<String> secondaryImageUrls;
}
