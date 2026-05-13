package fit.iuh.order.module.semanticsearch;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class SemanticEmbeddingService {

    private final RestClient restClient;
    private final String embeddingModel;

    public SemanticEmbeddingService(
        @Value("${ollama.base-url:http://ai-engine:11434}") String baseUrl,
        @Value("${ollama.embedding.model:granite-embedding-311m-multilingual-r2}") String embeddingModel
    ) {
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
        this.embeddingModel = embeddingModel;
    }

    public float[] generateEmbedding(String text) {
        OllamaEmbeddingResponse response = restClient.post()
            .uri("/api/embeddings")
            .contentType(MediaType.APPLICATION_JSON)
            .body(new OllamaEmbeddingRequest(embeddingModel, text))
            .retrieve()
            .body(OllamaEmbeddingResponse.class);

        if (response == null || response.embedding() == null || response.embedding().isEmpty()) {
            throw new IllegalStateException("Ollama did not return an embedding");
        }

        List<Double> embedding = response.embedding();
        float[] vector = new float[embedding.size()];
        for (int i = 0; i < embedding.size(); i++) {
            vector[i] = embedding.get(i).floatValue();
        }
        return vector;
    }

    public String toVectorLiteral(float[] vector) {
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                builder.append(", ");
            }
            builder.append(vector[i]);
        }
        builder.append("]");
        return builder.toString();
    }

    private record OllamaEmbeddingRequest(String model, String prompt) {
    }

    private record OllamaEmbeddingResponse(List<Double> embedding) {
    }
}
