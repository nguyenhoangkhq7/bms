package fit.iuh.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AiClientConfig {
    @Bean
    public RestClient aiRestClient(OllamaAIProperties properties) {
        return RestClient
            .builder()
            .baseUrl(properties.getBaseUrl())
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
}
