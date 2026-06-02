package fit.iuh.order.order.cqrs.write.repository;

import fit.iuh.order.order.cqrs.write.model.OrderEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderEventRepository extends JpaRepository<OrderEventEntity, String> {
    List<OrderEventEntity> findByAggregateIdOrderByVersionAsc(String aggregateId);
}
