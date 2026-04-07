package com.example.fashionstore.mapper.category;

import com.example.fashionstore.dto.category.CategoryDto;
import com.example.fashionstore.module.category.Category;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    /** Convert entity → DTO (shallow child, không đệ quy thêm) */
    public CategoryDto toDto(Category category) {
        if (category == null) return null;

        List<CategoryDto> children = Collections.emptyList();
        if (category.getChildCategories() != null) {
            children = category.getChildCategories().stream()
                    .map(this::toChildDto)
                    .collect(Collectors.toList());
        }

        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .parentCategoryId(
                        category.getParentCategory() != null
                                ? category.getParentCategory().getCategoryId()
                                : null
                )
                .childCategories(children)
                .build();
    }

    /** Convert child entity → DTO không có childCategories (tránh circular) */
    private CategoryDto toChildDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .parentCategoryId(
                        category.getParentCategory() != null
                                ? category.getParentCategory().getCategoryId()
                                : null
                )
                .childCategories(Collections.emptyList())
                .build();
    }

    public List<CategoryDto> toDtoList(List<Category> categories) {
        if (categories == null) return Collections.emptyList();
        return categories.stream().map(this::toDto).collect(Collectors.toList());
    }
}