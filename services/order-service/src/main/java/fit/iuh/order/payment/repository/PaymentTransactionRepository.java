package fit.iuh.order.payment.repository;

import fit.iuh.order.payment.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByIdAndIsDeletedFalse(Long id);
    boolean existsByIdAndIsDeletedFalse(Long id);
}
