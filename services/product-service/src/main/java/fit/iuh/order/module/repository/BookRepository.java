package fit.iuh.order.module.repository;


import fit.iuh.order.module.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Có thể tự định nghĩa thêm hàm tìm kiếm ở đây (ví dụ: tìm theo SKU, theo Tên)
    // List<Book> findByTitleContaining(String keyword);
}
