package fit.iuh.order.module.handler;

import org.springframework.stereotype.Component;

@Component
public class VoucherCheckHandler extends CheckoutHandler {
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
    }
}
