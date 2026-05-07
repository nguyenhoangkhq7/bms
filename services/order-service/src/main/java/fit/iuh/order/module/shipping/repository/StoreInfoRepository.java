package fit.iuh.order.module.shipping.repository;

import fit.iuh.order.module.models.StoreInfo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreInfoRepository extends JpaRepository<StoreInfo, Long> {
    Optional<StoreInfo> findTopByOrderByIdAsc();
}
