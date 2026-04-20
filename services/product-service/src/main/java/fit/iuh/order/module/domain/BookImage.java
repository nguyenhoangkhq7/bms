package fit.iuh.order.module.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book_images")
@Data
@NoArgsConstructor
public class BookImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    @JsonIgnore // Tránh lỗi lặp vô hạn khi trả JSON
    private Book book;

    // Constructor tiện lợi để tạo nhanh đối tượng
    public BookImage(String imageUrl, Book book) {
        this.imageUrl = imageUrl;
        this.book = book;
    }
}
