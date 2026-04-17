package com.example.fashionstore.service.category;

import com.example.fashionstore.dto.category.CategoryDto;
import com.example.fashionstore.mapper.category.CategoryMapper;
import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.repository.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Cache List<CategoryDto> thay vì ResponseEntity để tránh lỗi
     * "Cannot construct instance of ResponseEntity" khi Redis deserialize.
     */
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryDto> getAllCategories() {
        List<Category> cats = categoryRepository.findAllWithChildren();
        return categoryMapper.toDtoList(cats);
    }

    @Cacheable(value = "categories", key = "'roots'")
    public List<CategoryDto> getRootCategories() {
        List<Category> roots = categoryRepository.findByParentCategoryIsNull();
        return categoryMapper.toDtoList(roots);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public void evictAll() {
        // chỉ dùng để evict cache khi có thay đổi
    }
}