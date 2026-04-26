package fit.iuh.repository;

import fit.iuh.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    /** Kiểm tra token đã bị blacklist chưa (theo jti) */
    boolean existsById(String id);

    /** Xóa các bản ghi đã hết hạn – có thể gọi định kỳ để giữ bảng gọn */
    @Modifying
    @Transactional
    @Query("DELETE FROM InvalidatedToken t WHERE t.expiryTime < :now")
    void deleteAllExpiredBefore(Date now);
}
