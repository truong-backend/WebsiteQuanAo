package com.example.fashionstore.service.banner;

import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.banner.BannerDto;
import com.example.fashionstore.dto.banner.BannerRequest;
import com.example.fashionstore.module.banner.Banner;
import com.example.fashionstore.repository.banner.BannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BannerService {

    private final BannerRepository bannerRepository;

    // ── Public (frontend hiển thị) ──────────────────────────────────

    @Transactional(readOnly = true)
    public List<BannerDto> getActiveByType(Banner.BannerType type) {
        return bannerRepository
                .findActiveBannersByType(type, LocalDateTime.now())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BannerDto> getAllActive() {
        return bannerRepository
                .findByActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toDto).toList();
    }

    // ── Admin ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BannerDto> getAll() {
        return bannerRepository
                .findAllByOrderBySortOrderAscCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    public BannerDto create(BannerRequest req) {
        Banner banner = Banner.builder()
                .type(req.getType())
                .title(req.getTitle())
                .subtitle(req.getSubtitle())
                .imageUrl(req.getImageUrl())
                .linkUrl(req.getLinkUrl())
                .ctaText(req.getCtaText())
                .discountPercent(req.getDiscountPercent())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .active(req.getActive() != null ? req.getActive() : true)
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .popupDelaySeconds(req.getPopupDelaySeconds())
                .voucherCode(req.getVoucherCode())
                .build();
        return toDto(bannerRepository.save(banner));
    }

    public BannerDto update(Long id, BannerRequest req) {
        Banner banner = findOrThrow(id);
        banner.setType(req.getType());
        banner.setTitle(req.getTitle());
        banner.setSubtitle(req.getSubtitle());
        banner.setImageUrl(req.getImageUrl());
        banner.setLinkUrl(req.getLinkUrl());
        banner.setCtaText(req.getCtaText());
        banner.setDiscountPercent(req.getDiscountPercent());
        banner.setStartDate(req.getStartDate());
        banner.setEndDate(req.getEndDate());
        if (req.getActive() != null) banner.setActive(req.getActive());
        if (req.getSortOrder() != null) banner.setSortOrder(req.getSortOrder());
        banner.setPopupDelaySeconds(req.getPopupDelaySeconds());
        banner.setVoucherCode(req.getVoucherCode());
        return toDto(bannerRepository.save(banner));
    }

    public BannerDto toggleActive(Long id) {
        Banner banner = findOrThrow(id);
        banner.setActive(!banner.getActive());
        return toDto(bannerRepository.save(banner));
    }

    public void delete(Long id) {
        if (!bannerRepository.existsById(id))
            throw new ResourceNotFoundException("Banner", "id", id);
        bannerRepository.deleteById(id);
    }

    // Kéo thả reorder: nhận list id theo thứ tự mới
    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long bannerId = orderedIds.get(i);
            Banner banner = findOrThrow(bannerId);
            banner.setSortOrder(i);
            bannerRepository.save(banner);
        }
    }

    // ── Stats (impression / click) ──────────────────────────────────

    public void trackImpression(Long id) {
        bannerRepository.incrementImpressions(id);
    }

    public void trackClick(Long id) {
        bannerRepository.incrementClicks(id);
    }

    // ── Mapper ──────────────────────────────────────────────────────

    private Banner findOrThrow(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
    }

    public BannerDto toDto(Banner b) {
        double ctr = b.getImpressions() > 0
                ? (double) b.getClicks() / b.getImpressions() * 100
                : 0.0;
        return BannerDto.builder()
                .id(b.getId())
                .type(b.getType())
                .title(b.getTitle())
                .subtitle(b.getSubtitle())
                .imageUrl(b.getImageUrl())
                .linkUrl(b.getLinkUrl())
                .ctaText(b.getCtaText())
                .discountPercent(b.getDiscountPercent())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .active(b.getActive())
                .sortOrder(b.getSortOrder())
                .impressions(b.getImpressions())
                .clicks(b.getClicks())
                .ctr(Math.round(ctr * 100.0) / 100.0)
                .popupDelaySeconds(b.getPopupDelaySeconds())
                .voucherCode(b.getVoucherCode())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}