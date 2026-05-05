package fit.iuh.order.module.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content; // Nội dung đánh giá

    @Column(nullable = false)
    private int rating; // Số sao (1 đến 5)

    // Lưu tên người đánh giá
    @Column(nullable = false)
    private String userName;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Liên kết nhiều Review thuộc về 1 Book
    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonIgnore // Thêm dòng này để tránh lỗi vòng lặp vô hạn khi trả về JSON
    private Book book;
}
