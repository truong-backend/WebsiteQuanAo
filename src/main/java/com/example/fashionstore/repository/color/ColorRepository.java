package com.example.fashionstore.repository.color;

import com.example.fashionstore.module.color.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
    Optional<Color> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Color> findAllByActiveTrueOrderByNameAsc();
}