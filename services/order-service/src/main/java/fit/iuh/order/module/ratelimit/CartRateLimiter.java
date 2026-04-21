package fit.iuh.order.module.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CartRateLimiter {
    private static final long TOKENS_PER_MINUTE = 60;
    private final Map<Long, Bucket> userBuckets = new ConcurrentHashMap<>();

    public RateLimitDecision tryConsume(Long userId) {
        if (userId == null) {
            return new RateLimitDecision(true, 0);
        }

        Bucket bucket = userBuckets.computeIfAbsent(userId, key ->
            Bucket.builder()
                .addLimit(Bandwidth.classic(TOKENS_PER_MINUTE,
                    Refill.intervally(TOKENS_PER_MINUTE, Duration.ofMinutes(1))))
                .build());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            return new RateLimitDecision(true, 0);
        }

        long nanosToWait = probe.getNanosToWaitForRefill();
        long retryAfterSeconds = Math.max(1, (long) Math.ceil(nanosToWait / 1_000_000_000.0));
        return new RateLimitDecision(false, retryAfterSeconds);
    }

    public void clear() {
        userBuckets.clear();
    }
}