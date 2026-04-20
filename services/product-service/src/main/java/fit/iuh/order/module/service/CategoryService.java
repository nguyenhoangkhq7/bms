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

    // Lấy toàn bộ danh sách danh mục
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
