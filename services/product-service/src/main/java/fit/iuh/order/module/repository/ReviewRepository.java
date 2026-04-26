package fit.iuh.order.module.repository;


import fit.iuh.order.module.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Hàm tự định nghĩa: Lấy tất cả đánh giá của 1 quyển sách cụ thể
    List<Review> findByBookId(Long bookId);
}
