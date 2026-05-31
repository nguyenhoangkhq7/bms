package fit.iuh.order.order.cqrs.read.repository;

import fit.iuh.order.order.cqrs.read.model.OrderReadView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderReadViewRepository extends JpaRepository<OrderReadView, String> {
    java.util.List<OrderReadView> findByStatusAndCreatedAtBefore(String status, java.time.LocalDateTime dateTime);
}
