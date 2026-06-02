package fit.iuh.semanticsearch;

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
    Long categoryId,
    String imageUrl,
    String description,
    String categoryName,
    Long parentCategoryId,
    Double combinedScore
) {
    public SemanticBookSearchDTO withCombinedScore(Double newScore) {
        return new SemanticBookSearchDTO(
            id, title, author, publisher, price, stockQuantity, status,
            categoryId, imageUrl, description, categoryName, parentCategoryId, newScore
        );
    }
}
