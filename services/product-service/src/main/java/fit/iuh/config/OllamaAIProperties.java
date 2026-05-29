package fit.iuh.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ollama.ai")
@Getter
@Setter
public class OllamaAIProperties {
    private String baseUrl;
    private Chat chat = new Chat();
    private Embedding embedding = new Embedding();

    public String getChatModel() {
        return chat != null ? chat.getModel() : null;
    }

    public String getEmbeddingModel() {
        return embedding != null ? embedding.getModel() : null;
    }

    @Getter
    @Setter
    public static class Chat {
        private String model;
    }

    @Getter
    @Setter
    public static class Embedding {
        private String model;
    }
}
