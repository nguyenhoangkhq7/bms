package fit.iuh.order.shipping.repository;

import fit.iuh.order.shipping.model.ShippingAddress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByUserIdOrderByIsDefaultDescIdDesc(Long userId);

    Optional<ShippingAddress> findByIdAndUserId(Long id, Long userId);

    Optional<ShippingAddress> findFirstByUserIdAndIsDefaultTrue(Long userId);

    long countByUserId(Long userId);
}
