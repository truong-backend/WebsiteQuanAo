package com.example.Server.service;

import com.example.Server.dto.request.order.CreateOrderRequest;
import com.example.Server.dto.request.order.OrderCreateRequest;
import com.example.Server.dto.request.order.OrderUpdateRequest;
import com.example.Server.dto.response.order.OrderBasicResponse;
import com.example.Server.entity.*;
import com.example.Server.enums.OrderStatus;
import com.example.Server.enums.PaymentType;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.OrderMapper;
import com.example.Server.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service xử lý toàn bộ business logic liên quan đến Order.
 *
 * <p>Hỗ trợ hai luồng tạo đơn:
 * <ul>
 *   <li>{@link #createOrder(CreateOrderRequest)} — Mua ngay hoặc từ giỏ hàng (user flow)</li>
 *   <li>{@link #create(OrderCreateRequest)} — Admin tạo thủ công</li>
 * </ul>
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            AccountRepository accountRepository,
            PaymentRepository paymentRepository,
            OrderItemRepository orderItemRepository,
            ProductVariantRepository productVariantRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository
    ) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.orderItemRepository = orderItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    // ─────────────────────────── QUERY ───────────────────────────

    /**
     * Lấy danh sách đơn hàng với phân trang, tìm kiếm và bộ lọc.
     *
     * @param pageable  thông tin phân trang
     * @param search    từ khóa tìm kiếm (id, phoneNumber, address, status)
     * @param status    lọc theo trạng thái đơn hàng
     * @param startDate lọc từ ngày (format: yyyy-MM-dd)
     * @param endDate   lọc đến ngày (format: yyyy-MM-dd)
     * @param accountId lọc theo tài khoản
     * @return trang kết quả OrderBasicResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderBasicResponse> findAll(
            Pageable pageable,
            String search,
            OrderStatus status,
            String startDate,
            String endDate,
            Integer accountId
    ) {
        Specification<Order> spec = buildSpec(search, status, startDate, endDate, accountId);
        return orderRepository.findAll(spec, pageable).map(OrderMapper::toResponse);
    }

    /**
     * Lấy chi tiết đơn hàng theo id.
     *
     * @param id id của đơn hàng
     * @return OrderBasicResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderBasicResponse getById(String id) {
        Order order = findOrderById(id);
        order.getOrderItems().size(); // trigger lazy load
        return OrderMapper.toResponse(order);
    }

    // ─────────────────────────── CREATE / UPDATE / DELETE ───────────────────────────

    /**
     * Admin tạo đơn hàng thủ công.
     *
     * @param request dữ liệu tạo order
     * @return OrderBasicResponse
     */
    public OrderBasicResponse create(OrderCreateRequest request) {
        String orderId = (request.getId() == null || request.getId().isBlank())
                ? UUID.randomUUID().toString()
                : request.getId().trim();

        if (orderRepository.existsById(orderId)) {
            throw new ResourceAlreadyExistsException("Order", "id", orderId);
        }

        Order order = buildOrderFromRequest(orderId, request);
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Cập nhật đơn hàng theo id.
     *
     * @param id      id của đơn hàng
     * @param request dữ liệu cập nhật
     * @return OrderBasicResponse đã cập nhật
     */
    public OrderBasicResponse update(String id, OrderUpdateRequest request) {
        Order order = findOrderById(id);

        order.setOrderTime(request.getOrderTime());
        order.setPhoneNumber(normalizeString(request.getPhoneNumber()));
        order.setAddress(normalizeString(request.getAddress()));
        order.setNote(normalizeString(request.getNote()));
        order.setStatus(request.getStatus());
        order.setAccount(resolveAccount(request.getAccountId()));
        order.setPayment(resolvePayment(request.getPaymentId()));

        return OrderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Cập nhật chỉ trạng thái của đơn hàng.
     *
     * @param id     id của đơn hàng
     * @param status trạng thái mới
     * @return OrderBasicResponse đã cập nhật
     */
    public OrderBasicResponse updateStatus(String id, OrderStatus status) {
        Order order = findOrderById(id);
        order.setStatus(status);
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Xóa đơn hàng theo id (cascade xóa cả OrderItems).
     *
     * @param id id của đơn hàng
     */
    public void delete(String id) {
        Order order = findOrderById(id);
        orderRepository.delete(order);
    }

    // ─────────────────────────── USER FLOW ───────────────────────────

    /**
     * Tạo đơn hàng từ phía user (Mua ngay hoặc từ giỏ hàng).
     *
     * <p>Luồng xử lý:
     * <ol>
     *   <li>Tạo Payment với loại tương ứng</li>
     *   <li>Tạo Order và các OrderItem</li>
     *   <li>Giảm tồn kho từng variant</li>
     *   <li>Nếu COD → set payTime ngay</li>
     *   <li>Xóa các item tương ứng khỏi giỏ hàng của user (nếu có)</li>
     * </ol>
     *
     * @param request dữ liệu tạo đơn hàng từ user
     * @return OrderBasicResponse
     * @throws InvalidOperationException nếu tồn kho không đủ
     */
    public OrderBasicResponse createOrder(CreateOrderRequest request) {
        Account account = getCurrentAccount();

        Payment payment = createPaymentForOrder(request.getPaymentType());

        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setOrderTime(LocalDateTime.now());
        order.setPhoneNumber(request.getPhoneNumber().trim());
        order.setAddress(request.getAddress().trim());
        order.setNote(request.getNote());
        order.setStatus(OrderStatus.PENDING);
        order.setAccount(account);
        order.setPayment(payment);
        order.setOrderItems(new ArrayList<>());

        double totalAmount = 0;
        List<String> processedVariantIds = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "ProductVariant", "id", itemReq.getProductVariantId()));

            validateStock(variant, itemReq.getQuantity());

            Product product = variant.getProduct();
            double price = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();

            OrderItem orderItem = new OrderItem();
            orderItem.setId(UUID.randomUUID().toString());
            orderItem.setOrder(order);
            orderItem.setProductVariant(variant);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(price);

            order.getOrderItems().add(orderItem);
            totalAmount += price * itemReq.getQuantity();

            variant.setQuantity(variant.getQuantity() - itemReq.getQuantity());
            productVariantRepository.save(variant);
            processedVariantIds.add(variant.getId());
        }

        order.setTotalAmount(totalAmount);

        if (payment.getType() == PaymentType.COD) {
            payment.setPayTime(Instant.now());
        }

        orderRepository.save(order);

        // Xóa các item tương ứng khỏi giỏ hàng
        cartRepository.findByAccountId(account.getId()).ifPresent(cart ->
                processedVariantIds.forEach(variantId ->
                        cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variantId)
                                .ifPresent(cartItemRepository::delete)
                )
        );

        return OrderMapper.toResponse(order);
    }

    /**
     * Lấy lịch sử đơn hàng của user hiện tại.
     *
     * @return danh sách OrderBasicResponse theo thứ tự mới nhất
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrderBasicResponse> getMyOrders() {
        Account account = getCurrentAccount();
        return OrderMapper.toResponses(
                orderRepository.findByAccountIdOrderByOrderTimeDesc(account.getId())
        );
    }

    // ─────────────────────────── PRIVATE HELPERS ───────────────────────────

    private Specification<Order> buildSpec(
            String search, OrderStatus status,
            String startDate, String endDate, Integer accountId
    ) {
        Specification<Order> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("id").as(String.class)), keyword),
                    cb.like(cb.lower(root.get("phoneNumber")), keyword),
                    cb.like(cb.lower(root.get("address")), keyword),
                    cb.like(cb.lower(root.get("status").as(String.class)), keyword)
            ));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (startDate != null && !startDate.isBlank()) {
            try {
                LocalDateTime start = LocalDate.parse(startDate.trim()).atStartOfDay();
                spec = spec.and((root, query, cb) ->
                        cb.greaterThanOrEqualTo(root.get("orderTime"), start));
            } catch (Exception ignored) {}
        }
        if (endDate != null && !endDate.isBlank()) {
            try {
                LocalDateTime end = LocalDate.parse(endDate.trim()).atTime(LocalTime.MAX);
                spec = spec.and((root, query, cb) ->
                        cb.lessThanOrEqualTo(root.get("orderTime"), end));
            } catch (Exception ignored) {}
        }
        if (accountId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("account").get("id"), accountId));
        }

        return spec;
    }

    private Order buildOrderFromRequest(String orderId, OrderCreateRequest request) {
        Order order = new Order();
        order.setId(orderId);
        order.setOrderTime(request.getOrderTime());
        order.setPhoneNumber(normalizeString(request.getPhoneNumber()));
        order.setAddress(normalizeString(request.getAddress()));
        order.setNote(normalizeString(request.getNote()));
        order.setStatus(request.getStatus());
        order.setAccount(resolveAccount(request.getAccountId()));
        order.setPayment(resolvePayment(request.getPaymentId()));
        return order;
    }

    private Payment createPaymentForOrder(String paymentType) {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID().toString());
        payment.setType(PaymentType.valueOf(paymentType));
        payment.setPayTime(null);
        return payment;
    }

    private void validateStock(ProductVariant variant, int requestedQty) {
        if (variant.getQuantity() < requestedQty) {
            throw new InvalidOperationException(
                    "Sản phẩm '" + variant.getProduct().getName() +
                    "' không đủ hàng. Tồn kho: " + variant.getQuantity()
            );
        }
    }

    private Account resolveAccount(Integer accountId) {
        if (accountId == null) return null;
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
    }

    private Payment resolvePayment(String paymentId) {
        if (paymentId == null || paymentId.isBlank()) return null;
        return paymentRepository.findById(paymentId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));
    }

    private Order findOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private Account getCurrentAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails ud)) {
            throw new InvalidOperationException("User not authenticated.");
        }
        return accountRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", ud.getUsername()));
    }

    private String normalizeString(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }
}
