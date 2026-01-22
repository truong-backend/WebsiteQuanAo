package com.example.Server.services;

import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.dto.response.category.CategoryHeaderResponse;
import com.example.Server.dto.response.category.CategoryOptionResponse;
import com.example.Server.dto.response.category.CategoryResponse;
import com.example.Server.entity.Category;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.CategoryMapper;
import com.example.Server.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Find all categories with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<CategoryResponse> findAll(
            Pageable pageable,
            String search,
            Long parentId
    ) {
        Specification<Category> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("categoryName")), keyword)
            );
        }

        if (parentId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("parentCategory").get("categoryId"), parentId)
            );
        }

        return categoryRepository
                .findAll(spec, pageable)
                .map(CategoryMapper::toResponse);
    }

    /**
     * Create a new category
     */
    public CategoryHeaderResponse create(CategoryRequest request) {
        String categoryName = normalizeName(request.getCategoryName());

        if (categoryRepository.existsByCategoryName(categoryName)) {
            throw new ResourceAlreadyExistsException(
                    "Category",
                    "categoryName",
                    categoryName
            );
        }

        Category category = new Category();
        category.setCategoryName(categoryName);

        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category",
                            "id",
                            request.getParentCategoryId()
                    ));
            category.setParentCategory(parent);
        }

        Category saved = categoryRepository.save(category);
        return CategoryMapper.toHeaderResponse(saved);
    }

    /**
     * Update an existing category
     */
    public CategoryHeaderResponse update(Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category",
                        "id",
                        categoryId
                ));

        String categoryName = normalizeName(request.getCategoryName());

        if (categoryRepository.existsByCategoryNameAndCategoryIdNot(
                categoryName, categoryId)
        ) {
            throw new ResourceAlreadyExistsException(
                    "Category",
                    "categoryName",
                    categoryName
            );
        }

        category.setCategoryName(categoryName);

        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category",
                            "id",
                            request.getParentCategoryId()
                    ));

            if (parent.getCategoryId().equals(category.getCategoryId())) {
                throw new InvalidOperationException(
                        "Category cannot be parent of itself"
                );
            }

            if (isCircularRelationship(parent, category.getCategoryId())) {
                throw new InvalidOperationException(
                        "Cannot create circular parent-child relationship"
                );
            }

            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }

        Category saved = categoryRepository.save(category);
        return CategoryMapper.toHeaderResponse(saved);
    }

    /**
     * Delete a category by ID
     */
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category", "id", id)
                );

        if (category.getChildCategories() != null
                && !category.getChildCategories().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete category with subcategories. Please delete or reassign subcategories first."
            );
        }

        categoryRepository.delete(category);
    }

    /**
     * Get all root categories as tree structure
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<CategoryHeaderResponse> getRootCategories() {
        return CategoryMapper.toHeaderResponses(
                categoryRepository.findByParentCategoryIsNull()
        );
    }

    /**
     * Get category by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category", "id", id)
                );
        return CategoryMapper.toResponse(category);
    }

    /**
     * Get all categories as simple options (id and name only)
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<CategoryOptionResponse> getAllCategoryOptions() {
        return CategoryMapper.toOptionResponses(
                categoryRepository.findAll()
        );
    }

    /**
     * Get root categories as simple options (id and name only)
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<CategoryOptionResponse> getRootCategoryOptions() {
        return CategoryMapper.toOptionResponses(
                categoryRepository.findByParentCategoryIsNull()
        );
    }

    /**
     * Normalize category name (trim + single space)
     */
    private String normalizeName(String name) {
        return name == null
                ? null
                : name.trim().replaceAll("\\s+", " ");
    }

    /**
     * Check if setting parent would create a circular relationship
     */
    private boolean isCircularRelationship(Category parent, Long categoryId) {
        Category current = parent;
        while (current != null) {
            if (current.getCategoryId().equals(categoryId)) {
                return true;
            }
            current = current.getParentCategory();
        }
        return false;
    }
}
