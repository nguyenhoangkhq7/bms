package fit.iuh.order.shipping.repository;

import fit.iuh.order.shipping.model.StoreInfo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreInfoRepository extends JpaRepository<StoreInfo, Long> {
    Optional<StoreInfo> findTopByOrderByIdAsc();
}
