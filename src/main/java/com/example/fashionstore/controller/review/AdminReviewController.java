package com.example.fashionstore.controller.review;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.review.ReviewDto;
import com.example.fashionstore.service.review.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    /**
     * GET /api/v1/admin/reviews?approved=false&page=0&size=20
     * Lấy tất cả review (kể cả chưa duyệt) để admin quản lý.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getAllReviews(
            @RequestParam(required = false) Boolean approved,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReviewDto> result = reviewService.getAllReviewsAdmin(
                PageRequest.of(page, size, Sort.by("createdAt").descending()), approved);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * PATCH /api/v1/admin/reviews/{reviewId}/approve
     * Duyệt review cho phép hiển thị.
     */
    @PatchMapping("/{reviewId}/approve")
    public ResponseEntity<ApiResponse<ReviewDto>> approveReview(@PathVariable Integer reviewId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.approveReview(reviewId)));
    }

    /**
     * DELETE /api/v1/admin/reviews/{reviewId}
     * Admin xóa review bất kỳ.
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa đánh giá", null));
    }
}