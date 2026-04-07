package com.example.fashionstore.repository.size;

import com.example.fashionstore.module.size.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Long> {
    Optional<Size> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Size> findAllByActiveTrueOrderBySortOrderAsc();
}