package com.example.fashionstore.repository.banner;

import com.example.fashionstore.module.banner.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByTypeAndActiveTrueOrderBySortOrderAsc(Banner.BannerType type);

    List<Banner> findByActiveTrueOrderBySortOrderAsc();

    List<Banner> findAllByOrderBySortOrderAscCreatedAtDesc();

    // Banners đang trong thời gian hiển thị
    @Query("""
        SELECT b FROM Banner b
        WHERE b.active = true
          AND b.type = :type
          AND (b.startDate IS NULL OR b.startDate <= :now)
          AND (b.endDate IS NULL OR b.endDate >= :now)
        ORDER BY b.sortOrder ASC
    """)
    List<Banner> findActiveBannersByType(
            @Param("type") Banner.BannerType type,
            @Param("now")  LocalDateTime now);

    // Cập nhật impression hàng loạt
    @Modifying
    @Query("UPDATE Banner b SET b.impressions = b.impressions + 1 WHERE b.id = :id")
    void incrementImpressions(@Param("id") Long id);

    // Cập nhật click
    @Modifying
    @Query("UPDATE Banner b SET b.clicks = b.clicks + 1 WHERE b.id = :id")
    void incrementClicks(@Param("id") Long id);
}