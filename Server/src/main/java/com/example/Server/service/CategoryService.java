package com.example.Server.service;

import com.example.Server.dto.request.category.CategoryRequest;
import com.example.Server.dto.response.category.*;
import com.example.Server.entity.Category;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.*;
import com.example.Server.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý danh mục sản phẩm (Category).
 * Hỗ trợ cấu trúc cây đệ quy (parent - children).
 */
@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<CategoryResponse> findAll(Pageable pageable, String search, Long parentId) {
        Specification<Category> spec = Specification.where(null);
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("categoryName")), kw));
        }
        if (parentId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("parentCategory").get("categoryId"), parentId));
        }
        return categoryRepository.findAll(spec, pageable).map(CategoryMapper::toResponse);
    }

    public CategoryHeaderResponse create(CategoryRequest request) {
        String name = normalize(request.getCategoryName());
        if (categoryRepository.existsByCategoryName(name))
            throw new ResourceAlreadyExistsException("Category", "categoryName", name);

        Category category = new Category();
        category.setCategoryName(name);
        if (request.getParentCategoryId() != null) {
            category.setParentCategory(findCategoryById(request.getParentCategoryId()));
        }
        return CategoryHeaderMapper.toResponse(categoryRepository.save(category));
    }

    public CategoryHeaderResponse update(Long id, CategoryRequest request) {
        Category category = findCategoryById(id);
        String name = normalize(request.getCategoryName());
        if (categoryRepository.existsByCategoryNameAndCategoryIdNot(name, id))
            throw new ResourceAlreadyExistsException("Category", "categoryName", name);

        category.setCategoryName(name);
        if (request.getParentCategoryId() != null) {
            Category parent = findCategoryById(request.getParentCategoryId());
            if (parent.getCategoryId().equals(id))
                throw new InvalidOperationException("Category cannot be parent of itself");
            if (isCircular(parent, id))
                throw new InvalidOperationException("Cannot create circular parent-child relationship");
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }
        return CategoryHeaderMapper.toResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = findCategoryById(id);
        if (category.getChildCategories() != null && !category.getChildCategories().isEmpty())
            throw new InvalidOperationException("Cannot delete category with subcategories.");
        categoryRepository.delete(category);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<CategoryHeaderResponse> getRootCategories() {
        return CategoryHeaderMapper.toResponses(categoryRepository.findByParentCategoryIsNull());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public CategoryResponse getById(Long id) {
        return CategoryMapper.toResponse(findCategoryById(id));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<CategoryOptionResponse> getAllCategoryOptions() {
        return CategoryOptionMapper.toResponses(categoryRepository.findAll());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<CategoryOptionResponse> getRootCategoryOptions() {
        return CategoryOptionMapper.toResponses(categoryRepository.findByParentCategoryIsNull());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<NavbarCategoryResponse> getNavbarCategories() {
        return categoryRepository.findByParentCategoryIsNull().stream()
                .map(root -> new NavbarCategoryResponse(
                        root.getCategoryId(), root.getCategoryName(),
                        root.getChildCategories() == null ? List.of()
                                : root.getChildCategories().stream()
                                .map(c -> new NavbarCategoryResponse(c.getCategoryId(), c.getCategoryName(), List.of()))
                                .collect(Collectors.toList())
                )).collect(Collectors.toList());
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private boolean isCircular(Category parent, Long targetId) {
        Category current = parent;
        while (current != null) {
            if (current.getCategoryId().equals(targetId)) return true;
            current = current.getParentCategory();
        }
        return false;
    }

    private String normalize(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }
}
