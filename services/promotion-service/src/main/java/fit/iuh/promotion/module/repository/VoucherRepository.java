package fit.iuh.promotion.module.repository;

import fit.iuh.promotion.module.domain.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    // Tìm kiếm voucher theo mã code (rất quan trọng cho logic áp dụng mã)
    Optional<Voucher> findByCode(String code);
}