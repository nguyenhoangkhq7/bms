package fit.iuh.ai_helper;

public record SseChunk(String type, String payload) {
    public static SseChunk text(String token) { 
        return new SseChunk("text", "0:" + token); 
    }
    public static SseChunk thinking(String status) { 
        return new SseChunk("thinking", "1:" + status); 
    }
    public static SseChunk session(String sessionId) { 
        return new SseChunk("session", "2:{\"sessionId\":\"" + sessionId + "\"}"); 
    }
    public static SseChunk error(String errMsg) { 
        return new SseChunk("error", "3:{\"error\":\"" + errMsg + "\"}"); 
    }
    public static SseChunk bookCards(String jsonCards) { 
        return new SseChunk("book_cards", "8:" + jsonCards); 
    }
    public static SseChunk endStream(String metadata) { 
        return new SseChunk("end", "e:" + metadata); 
    }
}
