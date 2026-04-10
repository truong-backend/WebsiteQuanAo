package com.example.fashionstore.service.review;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.review.CreateReviewRequest;
import com.example.fashionstore.dto.review.ReviewDto;
import com.example.fashionstore.mapper.review.ReviewMapper;
import com.example.fashionstore.module.order.Order;
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

    private final ReviewRepository  reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository   orderRepository;

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ReviewDto> getProductReviews(String productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId, pageable)
                .map(ReviewMapper::toDto);
    }

    /**
     * Tạo review.
     * Rule quan trọng: User PHẢI đã mua sản phẩm này (có order COMPLETED hoặc DELIVERED).
     * Mỗi orderId chỉ review 1 lần / sản phẩm.
     */
    public ReviewDto createReview(CreateReviewRequest req) {
        User user = SecurityUtils.getCurrentUser();
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", req.getProductId()));

        // ── Bắt buộc phải có orderId ───────────────────────────────────
        if (req.getOrderId() == null || req.getOrderId().isBlank())
            throw new BusinessException("Bạn cần chọn đơn hàng đã mua để đánh giá sản phẩm này");

        // ── Verify order tồn tại, thuộc về user này, và đã hoàn thành ──
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng"));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId()))
            throw new BusinessException("Đơn hàng không thuộc về bạn");

        if (order.getStatus() != Order.OrderStatus.DELIVERED
                && order.getStatus() != Order.OrderStatus.COMPLETED)
            throw new BusinessException("Chỉ có thể đánh giá sau khi đơn hàng đã được giao");

        // ── Verify sản phẩm có trong đơn hàng ─────────────────────────
        boolean hasPurchased = orderRepository.existsByIdAndUserIdAndItemsProductVariantProductId(
                req.getOrderId(), user.getId(), req.getProductId()
        );
        if (!hasPurchased)
            throw new BusinessException("Sản phẩm này không có trong đơn hàng đã chỉ định");

        // ── Mỗi order chỉ review 1 lần / sản phẩm ─────────────────────
        if (reviewRepository.existsByUserIdAndProductIdAndOrderId(
                user.getId(), req.getProductId(), req.getOrderId()))
            throw new BusinessException("Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi");

        Review review = Review.builder()
                .product(product)
                .user(user)
                .orderId(req.getOrderId())
                .rating(req.getRating())
                .comment(req.getComment())
                .approved(false) // Chờ admin duyệt
                .build();

        Review saved = reviewRepository.save(review);

        // Cập nhật rating trung bình
        updateProductRating(product);

        return ReviewMapper.toDto(saved);
    }

    public void deleteReview(Integer reviewId) {
        User user = SecurityUtils.getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        boolean isAdmin = user.getRole() == User.Role.ROLE_ADMIN;
        if (!isAdmin && !review.getUser().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền xóa review này");

        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);
    }

    /** Admin duyệt review */
    public ReviewDto approveReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setApproved(true);
        Review saved = reviewRepository.save(review);
        updateProductRating(saved.getProduct());
        return ReviewMapper.toDto(saved);
    }

    /** Admin lấy tất cả review (kể cả chưa duyệt) để quản lý */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ReviewDto> getAllReviewsAdmin(Pageable pageable, Boolean approved) {
        if (approved != null) {
            return reviewRepository.findByApproved(approved, pageable).map(ReviewMapper::toDto);
        }
        return reviewRepository.findAll(pageable).map(ReviewMapper::toDto);
    }

    /** User lấy danh sách đơn hàng có thể review sản phẩm (DELIVERED/COMPLETED) */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ReviewableOrderDto> getReviewableOrders(String productId) {
        User user = SecurityUtils.getCurrentUser();
        List<Order> orders = orderRepository.findReviewableOrdersByUserAndProduct(
                user.getId(), productId
        );
        return orders.stream()
                .map(o -> new ReviewableOrderDto(
                        o.getId(),
                        o.getOrderTime().toString(),
                        reviewRepository.existsByUserIdAndProductIdAndOrderId(
                                user.getId(), productId, o.getId())
                ))
                .toList();
    }

    private void updateProductRating(Product product) {
        List<Integer> ratings = reviewRepository.findRatingsByProductId(product.getId());
        product.recalculateRating(ratings);
        productRepository.save(product);
    }

    public record ReviewableOrderDto(String orderId, String orderTime, boolean alreadyReviewed) {}
}