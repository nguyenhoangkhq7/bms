package fit.iuh.promotion.module.controller;

import fit.iuh.promotion.module.domain.Voucher;
import fit.iuh.promotion.module.domain.enums.VoucherStatus;
import fit.iuh.promotion.module.dto.VoucherApplyRequestDTO;
import fit.iuh.promotion.module.dto.VoucherApplyResponseDTO;
import fit.iuh.promotion.module.dto.VoucherRequestDTO;
import fit.iuh.promotion.module.service.VoucherAssistant;
import fit.iuh.promotion.module.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {
    private final VoucherService voucherService;
    private final VoucherAssistant assistant;

    public VoucherController(VoucherService voucherService, VoucherAssistant assistant) {
        this.voucherService = voucherService;
        this.assistant = assistant;
    }

    @GetMapping
    public ResponseEntity<List<Voucher>> getAll() {
        return ResponseEntity.ok(voucherService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Voucher> create(@Valid @RequestBody VoucherRequestDTO request) {
        return ResponseEntity.ok(voucherService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> update(@PathVariable Long id, @Valid @RequestBody VoucherRequestDTO request) {
        return ResponseEntity.ok(voucherService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Voucher> updateStatus(@PathVariable Long id, @RequestParam VoucherStatus status) {
        return ResponseEntity.ok(voucherService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Voucher> softDelete(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.softDelete(id));
    }

    @PostMapping("/apply")
    public ResponseEntity<VoucherApplyResponseDTO> apply(@Valid @RequestBody VoucherApplyRequestDTO request) {
        return ResponseEntity.ok(voucherService.apply(request));
    }

    @PostMapping("/ask-ai")
    public ResponseEntity<String> askAI(@RequestBody String message) {
        if (assistant == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("AI assistant is not configured. Please set a chat language model for promotion-service.");
        }
        return ResponseEntity.ok(assistant.suggestVoucher(message));
    }
}
