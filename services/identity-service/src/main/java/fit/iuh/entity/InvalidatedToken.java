package fit.iuh.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "invalidated_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvalidatedToken {

    /** JWT ID (jti claim) – dùng làm khóa chính */
    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    /** Thời điểm token hết hạn tự nhiên – dùng để cleanup sau này */
    @Column(name = "expiry_time", nullable = false)
    private Date expiryTime;
}
