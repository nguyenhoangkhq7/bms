package fit.iuh.order.module.ratelimit;

public record RateLimitDecision(boolean allowed, long retryAfterSeconds) {
}