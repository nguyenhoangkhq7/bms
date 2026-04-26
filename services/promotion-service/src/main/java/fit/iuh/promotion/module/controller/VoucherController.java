package fit.iuh.promotion.module.controller;

import fit.iuh.promotion.module.domain.Voucher;
import fit.iuh.promotion.module.service.VoucherAssistant;
import fit.iuh.promotion.module.service.VoucherService; // Cần thiết!
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired; // Cực kỳ quan trọng!
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;
    
    @Autowired
    private VoucherAssistant assistant;

    @GetMapping
    public ResponseEntity<List<Voucher>> getAll() {
        return ResponseEntity.ok(voucherService.getAll());
    }

    @PostMapping("/ask-ai")
    public ResponseEntity<String> askAI(@RequestBody String message) {
        return ResponseEntity.ok(assistant.suggestVoucher(message));
    }
}