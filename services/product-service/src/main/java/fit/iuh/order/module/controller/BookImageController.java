package fit.iuh.order.module.controller;


import fit.iuh.order.module.domain.BookImage;
import fit.iuh.order.module.service.BookImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books") // Gắn chung vào đường dẫn của sách
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})
public class BookImageController {

    @Autowired
    private BookImageService bookImageService;

    // API: Lấy toàn bộ ảnh phụ của 1 quyển sách (GET)
    @GetMapping("/{bookId}/images")
    public ResponseEntity<List<BookImage>> getBookImages(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookImageService.getImagesByBookId(bookId));
    }

    // API: Thêm lẻ 1 ảnh phụ cho sách (POST)
    @PostMapping("/{bookId}/images")
    public ResponseEntity<BookImage> addImageToBook(
        @PathVariable Long bookId,
        @RequestBody Map<String, String> requestBody) {

        // Trích xuất link ảnh từ JSON body
        String imageUrl = requestBody.get("imageUrl");

        BookImage newImage = bookImageService.addImageToBook(bookId, imageUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(newImage);
    }

    // API: Xoá 1 ảnh phụ (DELETE)
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        bookImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
