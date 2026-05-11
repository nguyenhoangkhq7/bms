package fit.iuh.order.module.semanticsearch;

import fit.iuh.order.module.domain.Book;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SemanticEmbeddingBackfillService {

    private static final Logger log = LoggerFactory.getLogger(SemanticEmbeddingBackfillService.class);

    private final SemanticEmbeddingService semanticEmbeddingService;
    private final BookSemanticRepository bookSemanticRepository;

    public SemanticEmbeddingBackfillService(SemanticEmbeddingService semanticEmbeddingService,
                                            BookSemanticRepository bookSemanticRepository) {
        this.semanticEmbeddingService = semanticEmbeddingService;
        this.bookSemanticRepository = bookSemanticRepository;
    }

    @Transactional
    public void backfillMissingEmbeddings() {
        List<Book> booksWithoutEmbedding = bookSemanticRepository.findBooksWithoutEmbedding();
        if (booksWithoutEmbedding.isEmpty()) {
            log.info("Semantic embedding backfill skipped: no books missing embeddings");
            return;
        }

        log.info("Semantic embedding backfill started for {} books", booksWithoutEmbedding.size());
        int updatedCount = 0;
        for (Book book : booksWithoutEmbedding) {
            try {
                float[] embedding = semanticEmbeddingService.generateEmbedding(book.buildTextForEmbedding());
                String embeddingLiteral = semanticEmbeddingService.toVectorLiteral(embedding);
                bookSemanticRepository.updateEmbedding(book.getId(), embeddingLiteral);
                updatedCount++;
            } catch (Exception exception) {
                log.warn("Failed to backfill embedding for book id={} title={}", book.getId(), book.getTitle(), exception);
            }
        }

        log.info("Semantic embedding backfill completed. Updated {} books", updatedCount);
    }
}