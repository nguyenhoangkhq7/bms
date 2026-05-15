package fit.iuh.order.module.controller;


import fit.iuh.order.module.domain.Review;
import fit.iuh.order.module.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books") // Vẫn dùng đường dẫn gốc của sách
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // API: Lấy danh sách review của 1 quyển sách (GET /api/books/{bookId}/reviews)
    @GetMapping("/{bookId}/reviews")
    public ResponseEntity<List<Review>> getReviewsOfBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
    }

    // API: Thêm review cho 1 quyển sách (POST /api/books/{bookId}/reviews)
    @PostMapping("/{bookId}/reviews")
    public ResponseEntity<Review> addReviewToBook(@PathVariable Long bookId, @RequestBody Review review) {
        Review newReview = reviewService.addReview(bookId, review);
        return ResponseEntity.status(HttpStatus.CREATED).body(newReview);
    }

    // API: Cập nhật 1 review (PUT /api/books/reviews/{reviewId}?userId=...&userName=...)
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long reviewId,
            @RequestBody Review review,
            @RequestParam Long userId,
            @RequestParam(required = false) String userName) {
        Review updated = reviewService.updateReview(reviewId, review, userId, userName);
        return ResponseEntity.ok(updated);
    }

    // API: Xoá 1 review (DELETE /api/books/reviews/{reviewId})
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
