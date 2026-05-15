package fit.iuh.order.module.repository;


import fit.iuh.order.module.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Tìm tất cả sách thuộc danh mục con cụ thể
    List<Book> findByCategoryId(Long categoryId);

    // Tìm tất cả sách thuộc về một danh mục cha (truy vấn cực nhanh nhờ parentCategoryId)
    List<Book> findByParentCategoryId(Long parentId);

    boolean existsByCategoryId(Long categoryId);
    boolean existsByParentCategoryId(Long parentId);
}
