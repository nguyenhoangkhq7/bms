package fit.iuh.order.module.semanticsearch;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HybridSearchService {

    private final SemanticEmbeddingService semanticEmbeddingService;
    private final BookSemanticRepository bookSemanticRepository;

    public HybridSearchService(SemanticEmbeddingService semanticEmbeddingService,
                               BookSemanticRepository bookSemanticRepository) {
        this.semanticEmbeddingService = semanticEmbeddingService;
        this.bookSemanticRepository = bookSemanticRepository;
    }

    public List<SemanticBookSearchDTO> hybridSearch(String query, int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        float[] embedding = semanticEmbeddingService.generateEmbedding(query);
        String vectorLiteral = semanticEmbeddingService.toVectorLiteral(embedding);

        return bookSemanticRepository.hybridSearch(vectorLiteral, query, safeLimit)
            .stream()
            .map(this::toDto)
            .toList();
    }

    private SemanticBookSearchDTO toDto(SemanticBookSearchProjection book) {
        return new SemanticBookSearchDTO(
            book.getId(),
            book.getTitle(),
            book.getAuthor(),
            book.getPublisher(),
            book.getPrice(),
            book.getStockQuantity(),
            book.getStatus(),
            book.getCategoryId(),
            book.getImageUrl(),
            book.getDescription(),
            book.getCategoryName(),
            book.getParentCategoryId(),
            book.getCombinedScore()
        );
    }
}