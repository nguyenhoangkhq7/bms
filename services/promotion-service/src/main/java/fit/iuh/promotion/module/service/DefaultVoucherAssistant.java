package fit.iuh.promotion.module.service;

import org.springframework.stereotype.Service;

@Service
public class DefaultVoucherAssistant implements VoucherAssistant {
    @Override
    public String suggestVoucher(String userDescription) {
        return "AI suggestion is not configured. Use active vouchers filtered by minimum order value and expiry date.";
    }
}
