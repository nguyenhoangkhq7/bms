package fit.iuh.promotion.module.service;

import fit.iuh.promotion.module.domain.Voucher;
import fit.iuh.promotion.module.domain.enums.DiscountType;
import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import fit.iuh.promotion.module.dto.VoucherApplyRequestDTO;
import fit.iuh.promotion.module.dto.VoucherApplyResponseDTO;
import fit.iuh.promotion.module.dto.VoucherRequestDTO;
import fit.iuh.promotion.module.repository.VoucherRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class VoucherService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final VoucherRepository voucherRepository;

    public VoucherService(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    public List<Voucher> getAll() {
        return voucherRepository.findAll();
    }

    public Voucher getById(Long id) {
        return findById(id);
    }

    @Transactional
    public Voucher create(VoucherRequestDTO request) {
        String code = normalizeCode(request.getCode());
        voucherRepository.findByCode(code).ifPresent(voucher -> {
            throw new IllegalArgumentException("Voucher code already exists");
        });

        Voucher voucher = new Voucher();
        voucher.setCode(code);
        voucher.setUsedCount(0);
        applyRequest(voucher, request);
        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher update(Long id, VoucherRequestDTO request) {
        Voucher voucher = findById(id);
        String code = normalizeCode(request.getCode());
        voucherRepository.findByCode(code)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Voucher code already exists");
                });

        voucher.setCode(code);
        applyRequest(voucher, request);
        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher updateStatus(Long id, VoucherStatus status) {
        Voucher voucher = findById(id);
        voucher.setStatus(status);
        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher softDelete(Long id) {
        Voucher voucher = findById(id);
        voucher.setStatus(VoucherStatus.DELETED);
        return voucherRepository.save(voucher);
    }

    @Transactional
    public VoucherApplyResponseDTO apply(VoucherApplyRequestDTO request) {
        Voucher voucher = voucherRepository.findByCode(normalizeCode(request.getCode()))
                .orElseThrow(() -> new EntityNotFoundException("Voucher not found"));
        ensureApplicable(voucher, request.getOrderValue());

        BigDecimal discount = calculateDiscount(voucher, request.getOrderValue());
        BigDecimal payable = request.getOrderValue().subtract(discount).max(BigDecimal.ZERO);
        voucher.setUsedCount((voucher.getUsedCount() == null ? 0 : voucher.getUsedCount()) + 1);
        voucherRepository.save(voucher);

        return new VoucherApplyResponseDTO(
                voucher.getCode(),
                request.getOrderValue(),
                discount,
                payable,
                "Voucher applied successfully"
        );
    }

    private void applyRequest(Voucher voucher, VoucherRequestDTO request) {
        validateRequest(request, voucher.getUsedCount());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountAmount(request.getDiscountAmount());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setMinOrderValue(request.getMinOrderValue() == null ? BigDecimal.ZERO : request.getMinOrderValue());
        voucher.setStartAt(request.getStartAt());
        voucher.setEndAt(request.getEndAt());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setStatus(request.getStatus() == null ? VoucherStatus.ACTIVE : request.getStatus());
        voucher.setDescription(request.getDescription());
        if (voucher.getUsedCount() == null) {
            voucher.setUsedCount(0);
        }
    }

    private void validateRequest(VoucherRequestDTO request, Integer usedCount) {
        if (request.getDiscountType() == DiscountType.PERCENTAGE &&
                (request.getDiscountAmount().compareTo(BigDecimal.ZERO) <= 0 ||
                        request.getDiscountAmount().compareTo(ONE_HUNDRED) > 0)) {
            throw new IllegalArgumentException("Percentage discount must be between 1 and 100");
        }
        if (request.getEndAt() != null && request.getStartAt() != null &&
                !request.getEndAt().isAfter(request.getStartAt())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (request.getUsageLimit() != null && request.getUsageLimit() < 0) {
            throw new IllegalArgumentException("Usage limit must not be negative");
        }
        if (request.getUsageLimit() != null && usedCount != null && request.getUsageLimit() < usedCount) {
            throw new IllegalArgumentException("Usage limit cannot be lower than used count");
        }
    }

    private void ensureApplicable(Voucher voucher, BigDecimal orderValue) {
        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new IllegalArgumentException("Voucher is not active");
        }
        if (voucher.getStartAt() != null && now.isBefore(voucher.getStartAt())) {
            throw new IllegalArgumentException("Voucher is not started yet");
        }
        if (voucher.getEndAt() != null && now.isAfter(voucher.getEndAt())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            throw new IllegalArgumentException("Voucher is expired");
        }
        BigDecimal minOrderValue = voucher.getMinOrderValue() == null ? BigDecimal.ZERO : voucher.getMinOrderValue();
        if (orderValue.compareTo(minOrderValue) < 0) {
            throw new IllegalArgumentException("Order value does not meet voucher minimum");
        }
        if (voucher.getUsageLimit() != null &&
                (voucher.getUsedCount() == null ? 0 : voucher.getUsedCount()) >= voucher.getUsageLimit()) {
            throw new IllegalArgumentException("Voucher usage limit reached");
        }
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal orderValue) {
        BigDecimal discount = voucher.getDiscountType() == DiscountType.PERCENTAGE
                ? orderValue.multiply(voucher.getDiscountAmount()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : voucher.getDiscountAmount();

        if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discount = discount.min(voucher.getMaxDiscountAmount());
        }
        return discount.min(orderValue).setScale(2, RoundingMode.HALF_UP);
    }

    private Voucher findById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Voucher not found"));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }
}
