package fit.iuh.order.module.service;

import fit.iuh.order.module.domain.Book;
import fit.iuh.order.module.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // Lấy tất cả sách
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // Lấy sách theo ID
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ID: " + id));
    }

    // Thêm sách mới
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    // Cập nhật sách
    public Book updateBook(Long id, Book bookDetails) {
        Book existingBook = getBookById(id);

        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setSku(bookDetails.getSku());
        existingBook.setPrice(bookDetails.getPrice());
        existingBook.setStockQuantity(bookDetails.getStockQuantity());
        existingBook.setStatus(bookDetails.getStatus());
        existingBook.setCategory(bookDetails.getCategory());
        existingBook.setImageUrl(bookDetails.getImageUrl());
        return bookRepository.save(existingBook);
    }

    // Xoá sách
    public void deleteBook(Long id) {
        Book existingBook = getBookById(id);
        bookRepository.delete(existingBook);
    }
}
