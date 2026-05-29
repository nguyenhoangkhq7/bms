package fit.iuh.order.module.order_management.eventsourcing.projection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderReadViewRepository extends JpaRepository<OrderReadView, String> {
}
