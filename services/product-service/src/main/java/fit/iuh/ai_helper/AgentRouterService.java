package fit.iuh.ai_helper;

import fit.iuh.config.OllamaAIProperties;
import fit.iuh.semanticsearch.HybridSearchService;
import fit.iuh.semanticsearch.SemanticBookSearchDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AgentRouterService {

    private final RuleIntentDetector ruleDetector;
    private final LlmIntentAnalyzer llmAnalyzer;
    private final HybridSearchService bookSearchService; // "Tool" cứng để lục lọi DB sách
    private final RestClient restClient;
    private final OllamaAIProperties properties;

    /**
     * Hàm điều phối chính: Xử lý câu hỏi của User và trả về câu thoại của AI
     */
    public String routeAndExecute(String userMessage) {
        IntentResponseDto extraction = resolveIntentResponse(userMessage);
        String systemPrompt = buildBaseSystemPrompt(extraction);

        if (Intent.BOOK_SEARCH.name().equalsIgnoreCase(extraction.getIntent())) {
            String cleanedKeyword = safeKeyword(extraction.getKeyword(), userMessage);
            BigDecimal maxPrice = extraction.getMaxPrice();

            List<SemanticBookSearchDTO> books = bookSearchService.hybridSearch(
                cleanedKeyword,
                5,
                0,
                null,
                null,
                maxPrice
            );

            String textContext = buildBookContext(books);
            systemPrompt = buildRagPrompt(extraction, textContext);
        } else if (Intent.ORDER_CHECKING.name().equalsIgnoreCase(extraction.getIntent())) {
            systemPrompt = buildOrderCheckingPrompt(extraction);
        }

        return generateFinalResponse(systemPrompt, userMessage);
    }

    /**
     * Giữ lại khả năng xuất text context cho dữ liệu sách đã được truy xuất.
     */
    public String performSemanticSearchToText(String userQuery) {
        List<SemanticBookSearchDTO> books = bookSearchService.hybridSearch(userQuery, 5, 0, null, null, null);
        return buildBookContext(books);
    }

    /**
     * Hàm phụ trợ: Tạo cấu trúc JSON Input và gửi sang Ollama endpoint /api/chat
     */
    private String generateFinalResponse(String systemPrompt, String userMessage) {
        String model = properties.getChatModel() == null || properties.getChatModel().isBlank()
            ? "qwen2.5"
            : properties.getChatModel().trim();

        var requestBody = new OllamaRequestDto(
            model,
            List.of(
                new OllamaMessageDto("system", systemPrompt),
                new OllamaMessageDto("user", userMessage)
            ),
            false
        );

        try {
            var response = restClient.post()
                .uri("/api/chat")
                .body(requestBody)
                .retrieve()
                .body(OllamaResponseDto.class);

            if (response != null && response.getMessage() != null) {
                String content = response.getMessage().getContent();
                if (content != null && !content.isBlank()) {
                    return content.trim();
                }
            }

        } catch (Exception e) {
            System.err.println("Lỗi kết nối API Ollama ở bước sinh câu trả lời: " + e.getMessage());
            return "Xin lỗi bạn, hệ thống xử lý AI của nhà sách đang bận xử lý. Bạn vui lòng thử lại sau giây lát!";
        }

        return "Hệ thống AI không đưa ra phản hồi.";
    }

    private IntentResponseDto resolveIntentResponse(String userMessage) {
        Optional<Intent> ruleIntent = ruleDetector.detect(userMessage);
        if (ruleIntent.isPresent()) {
            Intent intent = ruleIntent.get();
            if (Intent.BOOK_SEARCH.equals(intent)) {
                IntentResponseDto extracted = llmAnalyzer.analyzeWithLlm(userMessage);
                if (!Intent.BOOK_SEARCH.name().equalsIgnoreCase(extracted.getIntent())) {
                    extracted.setIntent(Intent.BOOK_SEARCH.name());
                }
                extracted.setKeyword(safeKeyword(extracted.getKeyword(), userMessage));
                return extracted;
            }
            return new IntentResponseDto(intent.name(), null, null);
        }

        return llmAnalyzer.analyzeWithLlm(userMessage);
    }

    private String buildBaseSystemPrompt(IntentResponseDto extraction) {
        String intent = extraction == null || extraction.getIntent() == null
            ? Intent.GENERAL_CHAT.name()
            : extraction.getIntent();

        return """
            Bạn là tư vấn viên ảo thân thiện, lịch sự của nhà sách.
            Hãy trả lời bằng tiếng Việt, ngắn gọn, tự nhiên và chính xác.
            Chỉ dùng dữ liệu thực tế được cung cấp trong ngữ cảnh.

            Intent đã trích xuất: %s
            """.formatted(intent);
    }

    private String buildOrderCheckingPrompt(IntentResponseDto extraction) {
        return buildBaseSystemPrompt(extraction) + "\n" + "Nếu khách đang hỏi đơn hàng, hãy yêu cầu họ cung cấp mã đơn hàng để hệ thống kiểm tra tiếp.";
    }

    private String buildRagPrompt(IntentResponseDto extraction, String textContext) {
        String keyword = extraction != null ? extraction.getKeyword() : null;
        String maxPrice = extraction != null && extraction.getMaxPrice() != null ? extraction.getMaxPrice().toPlainString() : "null";

        return """
            Bạn là tư vấn viên ảo thân thiện, lịch sự của nhà sách.
            Hãy trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, không bịa đặt dữ liệu.
            Chỉ được dựa trên ngữ cảnh sách bên dưới để tư vấn.

            Dữ liệu trích xuất:
            - intent: %s
            - keyword: %s
            - maxPrice: %s

            Ngữ cảnh sách thực tế:
            %s

            Quy tắc bắt buộc:
            - Nếu ngữ cảnh không có sách phù hợp, hãy nói rõ là chưa tìm thấy kết quả phù hợp.
            - Không tự thêm tên sách, tác giả hoặc giá tiền ngoài ngữ cảnh.
            - Ưu tiên gợi ý đúng theo keyword và maxPrice đã trích xuất.
            """.formatted(
                extraction != null && extraction.getIntent() != null ? extraction.getIntent() : Intent.BOOK_SEARCH.name(),
                keyword == null || keyword.isBlank() ? "null" : keyword,
                maxPrice,
                textContext
            );
    }

    private String buildBookContext(List<SemanticBookSearchDTO> books) {
        if (books == null || books.isEmpty()) {
            return "- Hiện không có sách nào khớp với truy vấn.";
        }

        return books.stream()
            .map(book -> {
                String priceText = book.price() == null ? "N/A" : book.price().stripTrailingZeros().toPlainString() + " VNĐ";
                String scoreText = book.combinedScore() == null ? "N/A" : String.format("%.4f", book.combinedScore());
                return """
                    - ID: %s
                      Tên sách: %s
                      Tác giả: %s
                      Nhà xuất bản: %s
                      Giá: %s
                      Danh mục: %s
                      Mô tả: %s
                      Điểm tổng hợp: %s
                    """.formatted(
                        book.id(),
                        safeText(book.title()),
                        safeText(book.author()),
                        safeText(book.publisher()),
                        priceText,
                        safeText(book.categoryName()),
                        safeText(book.description()),
                        scoreText
                    ).trim();
            })
            .collect(Collectors.joining("\n"));
    }

    private String safeKeyword(String keyword, String fallbackMessage) {
        String cleaned = cleanText(keyword);
        if (cleaned != null) {
            return cleaned;
        }

        return cleanSearchFallback(fallbackMessage);
    }

    private String cleanSearchFallback(String fallbackMessage) {
        String fallback = cleanText(fallbackMessage);
        if (fallback == null) {
            return "";
        }

        String sanitized = fallback
            .replaceAll("(?i)^(cho tôi|giúp tôi|mình muốn|tôi muốn|mình tìm|tôi tìm|tìm|mua|có|cho em|cho anh|cho chị)\\s+", "")
            .replaceAll("(?i)\\b(dưới|không quá|tối đa|max|nhỏ hơn)\\b.*$", "")
            .replaceAll("(?i)\\b(sách|cuốn|quyển)\\b", "")
            .replaceAll("\\s{2,}", " ")
            .trim();

        return sanitized.isBlank() ? fallback : sanitized;
    }

    private String cleanText(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value
            .replaceAll("[\\r\\n\\t]+", " ")
            .replaceAll("\\s{2,}", " ")
            .trim();

        if (cleaned.isBlank()) {
            return null;
        }

        return cleaned;
    }

    private String safeText(String value) {
        return cleanText(value) == null ? "N/A" : cleanText(value);
    }
}
