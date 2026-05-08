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

    // Cập nhật đánh giá (chỉ chủ sở hữu mới được sửa)
    public Review updateReview(Long reviewId, Review updatedData, Long userId, String userName) {
        Review existing = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + reviewId));

        // Kiểm tra quyền sở hữu: bằng userId hoặc userName (fallback cho review cũ)
        boolean isOwner = false;
        if (existing.getUserId() != null && existing.getUserId().equals(userId)) {
            isOwner = true;
        } else if (existing.getUserId() == null && userName != null && userName.equals(existing.getUserName())) {
            // Fallback cho review cũ chưa có userId - cập nhật userId luôn
            isOwner = true;
            existing.setUserId(userId);
        }

        if (!isOwner) {
            throw new RuntimeException("Bạn không có quyền sửa đánh giá này");
        }

        existing.setContent(updatedData.getContent());
        existing.setRating(updatedData.getRating());
        
        if (updatedData.getMediaUrls() != null) {
            existing.setMediaUrls(updatedData.getMediaUrls());
        }

        return reviewRepository.save(existing);
    }

    // Xoá đánh giá
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
