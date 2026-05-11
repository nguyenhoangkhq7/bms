package fit.iuh.order.module.semanticsearch;

import fit.iuh.order.module.domain.enums.BookStatus;

import java.math.BigDecimal;

public record SemanticBookSearchDTO(
    Long id,
    String title,
    String author,
    String publisher,
    BigDecimal price,
    Integer stockQuantity,
    BookStatus status,
    String imageUrl,
    String description,
    String categoryName,
    Long parentCategoryId,
    Double combinedScore
) {
}