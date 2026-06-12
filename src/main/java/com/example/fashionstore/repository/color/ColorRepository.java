package com.example.fashionstore.repository.color;

import com.example.fashionstore.module.color.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {

    // ================= FIND =================

    Optional<Color> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    // ================= STORE (USER) =================

    // Active + chưa xóa
    List<Color> findAllByActiveTrueAndDeletedFalseOrderByNameAsc();

    // Backward compatibility
    default List<Color> findAllByActiveTrueOrderByNameAsc() {
        return findAllByActiveTrueAndDeletedFalseOrderByNameAsc();
    }

    // ================= ADMIN =================

    // Tất cả chưa xóa (bao gồm inactive)
    List<Color> findAllByDeletedFalseOrderByNameAsc();

    // Tất cả (kể cả đã xóa)
    List<Color> findAll();
}