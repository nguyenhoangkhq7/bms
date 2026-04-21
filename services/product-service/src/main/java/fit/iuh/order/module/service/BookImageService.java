package fit.iuh.order.module.service;


import fit.iuh.order.module.domain.Book;
import fit.iuh.order.module.domain.BookImage;
import fit.iuh.order.module.repository.BookImageRepository;
import fit.iuh.order.module.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookImageService {

    @Autowired
    private BookImageRepository bookImageRepository;

    @Autowired
    private BookRepository bookRepository;

    // 1. Lấy danh sách ảnh phụ
    public List<BookImage> getImagesByBookId(Long bookId) {
        return bookImageRepository.findByBookId(bookId);
    }

    // 2. Thêm 1 ảnh phụ mới vào sách
    public BookImage addImageToBook(Long bookId, String imageUrl) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ID: " + bookId));

        BookImage newImage = new BookImage(imageUrl, book);
        return bookImageRepository.save(newImage);
    }

    // 3. Xoá ảnh phụ
    public void deleteImage(Long imageId) {
        bookImageRepository.deleteById(imageId);
    }
}
