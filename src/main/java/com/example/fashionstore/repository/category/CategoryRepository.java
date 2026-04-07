package com.example.fashionstore.repository.category;

import com.example.fashionstore.module.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentCategoryIsNull();

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.childCategories WHERE c.parentCategory IS NULL")
    List<Category> findAllWithChildren();
}