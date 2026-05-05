package fit.iuh.service;

import fit.iuh.repository.InvalidatedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupService {

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    /**
     * Tự động dọn dẹp các token đã hết hạn trong database.
     * Chạy vào lúc 3 giờ sáng mỗi ngày (Cron expression: "0 0 3 * * *")
     * Hoặc bạn có thể dùng fixedRate (ví dụ: mỗi 1 tiếng - 3600000 ms)
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredTokens() {
        log.info("Starting scheduled cleanup of expired invalidated tokens...");
        try {
            invalidatedTokenRepository.deleteAllExpiredBefore(new Date());
            log.info("Successfully cleaned up expired tokens.");
        } catch (Exception e) {
            log.error("Error occurred during expired token cleanup: {}", e.getMessage());
        }
    }
}
