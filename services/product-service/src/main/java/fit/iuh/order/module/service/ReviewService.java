package fit.iuh.order.module.service;


import fit.iuh.order.module.domain.Book;
import fit.iuh.order.module.domain.Review;
import fit.iuh.order.module.repository.BookRepository;
import fit.iuh.order.module.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

    // Lấy tất cả đánh giá của 1 quyển sách
    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    // Thêm đánh giá mới cho 1 quyển sách
    public Review addReview(Long bookId, Review review) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ID: " + bookId));

        review.setBook(book); // Gắn quyển sách vào review
        return reviewRepository.save(review);
    }

    // Xoá đánh giá
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
