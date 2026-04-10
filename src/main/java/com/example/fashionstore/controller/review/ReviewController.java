package com.example.fashionstore.controller.review;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.review.CreateReviewRequest;
import com.example.fashionstore.dto.review.ReviewDto;
import com.example.fashionstore.service.review.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** GET /api/v1/products/{productId}/reviews — danh sách review đã duyệt */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewDto> result = reviewService.getProductReviews(
                productId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * GET /api/v1/products/{productId}/reviews/reviewable-orders
     * Trả về danh sách đơn hàng mà user đã mua sản phẩm này và có thể review.
     */
    @GetMapping("/reviewable-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReviewService.ReviewableOrderDto>>> getReviewableOrders(
            @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewableOrders(productId)));
    }

    /** POST /api/v1/products/{productId}/reviews */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @PathVariable String productId,
            @Valid @RequestBody CreateReviewRequest req) {
        req.setProductId(productId);
        ReviewDto review = reviewService.createReview(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(review));
    }

    /** DELETE /api/v1/products/{productId}/reviews/{reviewId} */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa đánh giá", null));
    }
}