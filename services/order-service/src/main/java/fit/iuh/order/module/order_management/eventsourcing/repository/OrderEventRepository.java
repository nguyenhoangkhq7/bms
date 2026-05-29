package fit.iuh.order.module.order_management.eventsourcing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderEventRepository extends JpaRepository<OrderEventEntity, String> {
    List<OrderEventEntity> findByAggregateIdOrderByVersionAsc(String aggregateId);
}
