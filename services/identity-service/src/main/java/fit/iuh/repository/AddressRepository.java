package fit.iuh.repository;

import fit.iuh.entity.Address;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface AddressRepository extends CrudRepository<Address, Long> {
    Optional<Address> findTopByUserIdOrderByIdAsc(Long userId);
}
