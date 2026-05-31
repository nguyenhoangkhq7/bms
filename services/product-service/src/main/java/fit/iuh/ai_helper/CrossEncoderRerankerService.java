package fit.iuh.ai_helper;

import fit.iuh.semanticsearch.SemanticBookSearchDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CrossEncoderRerankerService {

    private final RestClient rerankerClient;

    public CrossEncoderRerankerService() {
        // Kết nối tới container Reranker (HuggingFace TEI trên port 80 nội bộ mạng docker)
        this.rerankerClient = RestClient.builder()
            .baseUrl("http://reranker-service:80")
            .defaultHeader("Content-Type", "application/json")
            .build();
    }

    public List<SemanticBookSearchDTO> rerank(String query, List<SemanticBookSearchDTO> candidates, int limit) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }

        // Tạo mảng bản sao để chỉnh sửa điểm score
        List<SemanticBookSearchDTO> mutableCandidates = new ArrayList<>(candidates);

        // Chuẩn bị payload cho TEI: { "query": "...", "texts": [...] }
        Map<String, Object> requestBody = Map.of(
            "query", query,
            "texts", mutableCandidates.stream()
                .map(this::buildRerankDocument)
                .toList()
        );

        try {
            // Nhận kết quả từ TEI
            List<Map<String, Object>> response = rerankerClient.post()
                .uri("/rerank")
                .body(requestBody)
                .retrieve()
                .body(List.class);

            if (response == null || response.isEmpty()) {
                return mutableCandidates.stream().limit(limit).toList();
            }

            // Tạo một map tạm thời lưu điểm sau khi cập nhật để tránh ghi đè chỉ số không chính xác
            SemanticBookSearchDTO[] rankedArray = new SemanticBookSearchDTO[mutableCandidates.size()];

            for (Map<String, Object> item : response) {
                int index = ((Number) item.get("index")).intValue();
                double score = ((Number) item.get("score")).doubleValue();
                
                if (index >= 0 && index < mutableCandidates.size()) {
                    rankedArray[index] = mutableCandidates.get(index).withCombinedScore(score);
                }
            }

            // Lọc ra các phần tử không null và chuyển về list
            List<SemanticBookSearchDTO> rerankedList = Arrays.stream(rankedArray)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

            // Sắp xếp giảm dần theo score từ Cross-Encoder
            rerankedList.sort(Comparator.comparingDouble(SemanticBookSearchDTO::combinedScore).reversed());

            return rerankedList.stream()
                .limit(limit)
                .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Lỗi khi chạy Reranker Cross-Encoder: " + e.getMessage() + ". Hạ cấp xuống dùng điểm PostgreSQL.");
            return mutableCandidates.stream().limit(limit).toList();
        }
    }

    private String buildRerankDocument(SemanticBookSearchDTO book) {
        return "Tên sách: " + book.title() + 
               " | Tác giả: " + book.author() + 
               " | Danh mục: " + book.categoryName() + 
               " | Mô tả: " + book.description() + 
               " | Giá: " + (book.price() != null ? book.price().longValue() : 0) + " VNĐ";
    }
}
