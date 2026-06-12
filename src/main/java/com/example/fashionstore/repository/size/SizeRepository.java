package com.example.fashionstore.repository.size;

import com.example.fashionstore.module.size.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Long> {

    // ================= FIND =================

    Optional<Size> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    // ================= STORE (USER) =================

    // Active + chưa xóa
    List<Size> findAllByActiveTrueAndDeletedFalseOrderBySortOrderAsc();

    // Backward compatibility
    default List<Size> findAllByActiveTrueOrderBySortOrderAsc() {
        return findAllByActiveTrueAndDeletedFalseOrderBySortOrderAsc();
    }

    // ================= ADMIN =================

    // Tất cả chưa xóa (bao gồm inactive)
    List<Size> findAllByDeletedFalseOrderBySortOrderAsc();

    // Tất cả kể cả đã xóa (dùng cho admin panel)
    @Query("SELECT s FROM Size s ORDER BY s.sortOrder ASC")
    List<Size> findAllIncludingDeleted();

    // Tìm theo id kể cả đã xóa (dùng trong service khi restore/hardDelete)
    @Query("SELECT s FROM Size s WHERE s.id = :id")
    Optional<Size> findByIdIncludingDeleted(@Param("id") Long id);
}