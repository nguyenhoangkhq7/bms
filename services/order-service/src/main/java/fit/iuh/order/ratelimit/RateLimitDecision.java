package fit.iuh.order.ratelimit;

public record RateLimitDecision(boolean allowed, long retryAfterSeconds) {
}