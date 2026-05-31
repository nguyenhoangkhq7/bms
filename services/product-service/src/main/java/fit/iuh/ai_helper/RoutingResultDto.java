package fit.iuh.ai_helper;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RoutingResultDto(
    @JsonProperty("routing_path") String routingPath, // "FAST" hoặc "DEEP"
    @JsonProperty("intent") String intent,
    @JsonProperty("extracted_keywords") List<String> extractedKeywords,
    @JsonProperty("reason") String reason
) {
    public static RoutingResultDto fastFallback(String reason) {
        return new RoutingResultDto("FAST", "TIM_SACH", List.of(), reason);
    }
}
