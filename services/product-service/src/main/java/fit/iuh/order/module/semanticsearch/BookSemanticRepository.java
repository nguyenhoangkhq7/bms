package fit.iuh.order.module.semanticsearch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookSemanticRepository extends JpaRepository<fit.iuh.order.module.domain.Book, Long> {

    @Query(value = "SELECT * FROM books WHERE embedding IS NULL", nativeQuery = true)
    List<fit.iuh.order.module.domain.Book> findBooksWithoutEmbedding();

    @Query(value = "SELECT "
        + "b.id as id, "
        + "b.title as title, "
        + "b.author as author, "
        + "b.publisher as publisher, "
        + "b.price as price, "
        + "b.stock_quantity as stockQuantity, "
        + "b.status as status, "
        + "b.image_url as imageUrl, "
        + "b.description as description, "
        + "c.name as categoryName, "
        + "b.parent_category_id as parentCategoryId "
        + "FROM books b "
        + "LEFT JOIN categories c ON c.id = b.category_id "
        + "WHERE b.status = 'AVAILABLE' AND b.embedding IS NOT NULL "
        + "ORDER BY b.embedding <=> cast(:queryVector as vector) "
        + "LIMIT :limit", nativeQuery = true)
    List<SemanticBookSearchProjection> semanticSearch(@Param("queryVector") String queryVector, @Param("limit") int limit);

    @Modifying
    @Query(value = "UPDATE books SET embedding = cast(:embedding as vector) WHERE id = :id", nativeQuery = true)
    int updateEmbedding(@Param("id") Long id, @Param("embedding") String embedding);
}
