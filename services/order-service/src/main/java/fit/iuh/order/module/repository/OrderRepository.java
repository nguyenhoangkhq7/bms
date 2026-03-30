package fit.iuh.order.module.repository;

import fit.iuh.order.module.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
