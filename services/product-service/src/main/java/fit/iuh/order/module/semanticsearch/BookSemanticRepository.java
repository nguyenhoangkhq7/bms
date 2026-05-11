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

    @Query(value = "SELECT * FROM books WHERE fts_tokens IS NULL", nativeQuery = true)
    List<fit.iuh.order.module.domain.Book> findBooksWithoutFtsTokens();

    @Query(value = "SELECT "
        + "b.id as id, "
        + "b.title as title, "
        + "b.author as author, "
        + "b.publisher as publisher, "
        + "b.price as price, "
        + "b.stock_quantity as stockQuantity, "
        + "b.status as status, "
        + "b.category_id as categoryId, "
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

    @Modifying
    @Query(value = "UPDATE books SET fts_tokens = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(author, '')) WHERE id = :id", nativeQuery = true)
    int updateFtsTokens(@Param("id") Long id);

    @Query(value = "SELECT "
        + "b.id as id, "
        + "b.title as title, "
        + "b.author as author, "
        + "b.publisher as publisher, "
        + "b.price as price, "
        + "b.stock_quantity as stockQuantity, "
        + "b.status as status, "
        + "b.category_id as categoryId, "
        + "b.image_url as imageUrl, "
        + "b.description as description, "
        + "c.name as categoryName, "
        + "b.parent_category_id as parentCategoryId, "
        + "((1 - (b.embedding <=> cast(:vector as vector))) * 0.7 + "
        + "(coalesce(ts_rank_cd(b.fts_tokens, plainto_tsquery('simple', :query)), 0) * 0.3)) as combinedScore "
        + "FROM books b "
        + "LEFT JOIN categories c ON c.id = b.category_id "
        + "WHERE b.status IN ('ACTIVE', 'AVAILABLE') AND b.embedding IS NOT NULL AND b.fts_tokens IS NOT NULL "
        + "ORDER BY combinedScore DESC "
        + "LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<SemanticBookSearchProjection> hybridSearch(@Param("vector") String vector,
                                                    @Param("query") String query,
                                                    @Param("limit") int limit,
                                                    @Param("offset") int offset);
}
