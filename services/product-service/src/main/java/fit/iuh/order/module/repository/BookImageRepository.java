package fit.iuh.order.module.repository;


import fit.iuh.order.module.domain.BookImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookImageRepository extends JpaRepository<BookImage, Long> {
    // Tự định nghĩa hàm: Lấy toàn bộ ảnh phụ của 1 quyển sách
    List<BookImage> findByBookId(Long bookId);
}
