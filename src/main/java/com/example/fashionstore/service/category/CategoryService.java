package com.example.fashionstore.service.category;

import com.example.fashionstore.dto.category.CategoryDto;
import com.example.fashionstore.mapper.category.CategoryMapper;
import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.repository.category.CategoryRepository;
import com.example.fashionstore.repository.product.ProductRepository;
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
    private final ProductRepository productRepository;

    // ── Read ─────────────────────────────────────────────

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

    // ── Soft delete ──────────────────────────────────────

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.isDeleted())
            throw new RuntimeException("Danh mục này đã bị xóa");

        // Kiểm tra danh mục có sản phẩm đang dùng không
        boolean hasProducts = productRepository.existsByCategoryCategoryId(id);
        if (hasProducts)
            throw new RuntimeException("Không thể xóa: danh mục đang có sản phẩm sử dụng");

        category.softDelete();
        categoryRepository.save(category);
    }

    // ── Restore ──────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto restore(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.isDeleted())
            throw new RuntimeException("Danh mục này chưa bị xóa");

        category.restore();
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    // ── Hard delete ──────────────────────────────────────

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void hardDelete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.isDeleted())
            throw new RuntimeException("Chỉ xóa vĩnh viễn danh mục đã xóa mềm");

        // Kiểm tra còn sản phẩm đang dùng danh mục này không
        boolean hasProducts = productRepository.existsByCategoryCategoryId(id);
        if (hasProducts)
            throw new RuntimeException("Không thể xóa vĩnh viễn: danh mục vẫn còn sản phẩm đang sử dụng");

        categoryRepository.delete(category);
    }

    public List<CategoryDto> getAllCategoriesAdmin() {
        List<Category> cats = categoryRepository.findAllWithChildrenAdmin();
        return categoryMapper.toDtoList(cats);
    }

    // ── Cache helper ─────────────────────────────────────

    @CacheEvict(value = "categories", allEntries = true)
    public void evictAll() {
        // dùng khi cần clear cache
    }
}