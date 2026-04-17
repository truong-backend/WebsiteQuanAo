package com.example.fashionstore.repository.category;

import com.example.fashionstore.module.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // ================= STORE (CHỈ LẤY CHƯA XÓA) =================

    // Root category chưa bị xóa
    List<Category> findByParentCategoryIsNullAndDeletedFalse();

    // Backward compatibility (giữ code cũ không bị vỡ)
    default List<Category> findByParentCategoryIsNull() {
        return findByParentCategoryIsNullAndDeletedFalse();
    }

    // Lấy root + children (chưa xóa)
    @Query("""
        SELECT c FROM Category c LEFT JOIN FETCH c.childCategories
        WHERE c.parentCategory IS NULL AND c.deleted = false
    """)
    List<Category> findAllWithChildren();

    // ================= ADMIN (LẤY CẢ ĐÃ XÓA) =================

    @Query("""
        SELECT c FROM Category c LEFT JOIN FETCH c.childCategories
        WHERE c.parentCategory IS NULL
    """)
    List<Category> findAllWithChildrenAdmin();
}