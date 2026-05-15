package fit.iuh.order.module.service;


import fit.iuh.order.module.domain.Category;
import fit.iuh.order.module.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private fit.iuh.order.module.repository.BookRepository bookRepository;

    // Lấy toàn bộ danh sách danh mục
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(fit.iuh.order.module.dto.CategoryRequestDTO request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setParentId(request.getParentId());
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, fit.iuh.order.module.dto.CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        category.setParentId(request.getParentId());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        if (categoryRepository.existsByParentId(id)) {
            throw new RuntimeException("Không thể xóa danh mục đang có danh mục con");
        }
        if (bookRepository.existsByCategoryId(id) || bookRepository.existsByParentCategoryId(id)) {
            throw new RuntimeException("Không thể xóa danh mục đang có sách");
        }
        categoryRepository.deleteById(id);
    }
}
