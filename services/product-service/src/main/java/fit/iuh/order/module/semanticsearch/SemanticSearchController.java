package fit.iuh.order.module.semanticsearch;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})
public class SemanticSearchController {

    private final SemanticEmbeddingService semanticEmbeddingService;
    private final BookSemanticRepository bookSemanticRepository;

    public SemanticSearchController(SemanticEmbeddingService semanticEmbeddingService,
                                    BookSemanticRepository bookSemanticRepository) {
        this.semanticEmbeddingService = semanticEmbeddingService;
        this.bookSemanticRepository = bookSemanticRepository;
    }

    @GetMapping("/semantic-search")
    public List<SemanticBookSearchDTO> semanticSearch(@RequestParam("query") String query,
                                                      @RequestParam(value = "limit", defaultValue = "10") int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        float[] embedding = semanticEmbeddingService.generateEmbedding(query);
        String vectorString = toVectorString(embedding);
        List<SemanticBookSearchProjection> results = bookSemanticRepository.semanticSearch(vectorString, safeLimit);
        return results.stream().map(this::toDto).toList();
    }

    private String toVectorString(float[] vector) {
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                builder.append(", ");
            }
            builder.append(Float.toString(vector[i]));
        }
        builder.append("]");
        return builder.toString();
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
            book.getImageUrl(),
            book.getDescription(),
            book.getCategoryName(),
            book.getParentCategoryId()
        );
    }
}
