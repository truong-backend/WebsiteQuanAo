package com.example.fashionstore.service.review;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.review.CreateReviewRequest;
import com.example.fashionstore.dto.review.ReviewDto;
import com.example.fashionstore.mapper.review.ReviewMapper;
import com.example.fashionstore.repository.order.OrderRepository;
import com.example.fashionstore.module.product.Product;
import com.example.fashionstore.repository.product.ProductRepository;
import com.example.fashionstore.module.review.Review;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.review.ReviewRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository   orderRepository;

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ReviewDto> getProductReviews(String productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId, pageable)
                .map(ReviewMapper::toDto);
    }

    public ReviewDto createReview(CreateReviewRequest req) {
        User user = SecurityUtils.getCurrentUser();
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", req.getProductId()));

        // Verify user đã mua sản phẩm này (optional nhưng nên có)
        if (req.getOrderId() != null) {
            boolean hasPurchased = orderRepository.existsByIdAndUserIdAndItemsProductVariantProductId(
                    req.getOrderId(), user.getId(), req.getProductId()
            );
            if (!hasPurchased)
                throw new BusinessException("Bạn chưa mua sản phẩm này trong đơn hàng đã chỉ định");

            if (reviewRepository.existsByUserIdAndProductIdAndOrderId(
                    user.getId(), req.getProductId(), req.getOrderId()))
                throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .orderId(req.getOrderId())
                .rating(req.getRating())
                .comment(req.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        // Cập nhật rating trung bình của sản phẩm
        updateProductRating(product);

        return ReviewMapper.toDto(saved);
    }

    public void deleteReview(Integer reviewId) {
        User user = SecurityUtils.getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Admin có thể xóa mọi review, user chỉ xóa review của mình
        boolean isAdmin = user.getRole() == User.Role.ROLE_ADMIN;
        if (!isAdmin && !review.getUser().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền xóa review này");

        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        List<Integer> ratings = reviewRepository.findRatingsByProductId(product.getId());
        product.recalculateRating(ratings);
        productRepository.save(product);
    }
}