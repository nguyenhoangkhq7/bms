package fit.iuh.order.checkout.handler;

import fit.iuh.order.checkout.model.CheckoutContext;
import fit.iuh.order.client.promotion.PromotionClient;
import fit.iuh.order.client.promotion.PromotionVoucherResponse;
import fit.iuh.order.exception.BadRequestException;
import fit.iuh.order.exception.NotFoundException;
import io.github.resilience4j.retry.annotation.Retry;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class VoucherCheckHandler extends CheckoutHandler {
    private final PromotionClient promotionClient;

    @Override
    @Retry(name = "backendCallRetry", fallbackMethod = "fallbackVoucherCheck")
    public void handle(CheckoutContext context) {
        log.info("Starting voucher check execution for user: {}", context.getUserId());
        process(context);
        handleNext(context);
    }

    @Override
    protected void process(CheckoutContext context) {
        if (context.getVoucherCode() == null) {
            return;
        }

        String normalized = context.getVoucherCode().trim();
        if (normalized.isEmpty()) {
            context.setVoucherCode(null);
            return;
        }

        context.setVoucherCode(normalized);

        Optional<PromotionVoucherResponse> voucherOpt = promotionClient.getVoucherByCode(normalized);
        if (voucherOpt.isEmpty()) {
            throw new NotFoundException("Mã giảm giá không tồn tại: " + normalized);
        }

        PromotionVoucherResponse voucher = voucherOpt.get();
        if (!voucher.isActive()) {
            throw new BadRequestException("Mã giảm giá không còn hoạt động: " + normalized);
        }
    }

    public void fallbackVoucherCheck(CheckoutContext context, Exception ex) {
        log.error("All retry attempts failed to call promotion-service in VoucherCheckHandler. Error: {}. Bypassing voucher check with default values.", ex.getMessage(), ex);
        context.setMetadata("PROMOTION_CHECK_STATUS", "SERVICE_TIMEOUT_BYPASSED");
        context.setVoucherDiscount(0.0);
        handleNext(context);
    }
}
