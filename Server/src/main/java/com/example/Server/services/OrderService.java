package com.example.Server.services;

import com.example.Server.dto.request.order.OrderCreateRequest;
import java.util.UUID;
import com.example.Server.dto.request.order.OrderLineRequest;
import com.example.Server.dto.request.order.OrderUpdateRequest;
import com.example.Server.dto.response.order.OrderResponse;
import com.example.Server.entity.Account;
import com.example.Server.entity.Order;
import com.example.Server.entity.OrderItem;
import com.example.Server.entity.Payment;
import com.example.Server.entity.ProductVariant;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.OrderMapper;
import com.example.Server.repository.OrderItemRepository;
import com.example.Server.repository.OrderRepository;
import com.example.Server.repository.AccountRepository;
import com.example.Server.repository.PaymentRepository;
import com.example.Server.repository.ProductVariantRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.Server.enums.OrderStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;

    public OrderService(
            OrderRepository orderRepository,
            AccountRepository accountRepository,
            PaymentRepository paymentRepository,
            OrderItemRepository orderItemRepository,
            ProductVariantRepository productVariantRepository
    ) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.orderItemRepository = orderItemRepository;
        this.productVariantRepository = productVariantRepository;
    }

    /**
     * Find all orders with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderResponse> findAll(Pageable pageable, String search,
                                       OrderStatus status, String startDate, String endDate, Integer accountId) {
        Specification<Order> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("id").as(String.class)), keyword),
                            cb.like(cb.lower(root.get("phoneNumber")), keyword),
                            cb.like(cb.lower(root.get("address")), keyword),
                            cb.like(cb.lower(root.get("status").as(String.class)), keyword)
                    )
            );
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (startDate != null && !startDate.isBlank()) {
            try {
                LocalDateTime start = LocalDate.parse(startDate.trim()).atStartOfDay();
                spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("orderTime"), start));
            } catch (Exception ignored) {}
        }
        if (endDate != null && !endDate.isBlank()) {
            try {
                LocalDateTime end = LocalDate.parse(endDate.trim()).atTime(LocalTime.MAX);
                spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("orderTime"), end));
            } catch (Exception ignored) {}
        }
        if (accountId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("account").get("id"), accountId));
        }

        return orderRepository
                .findAll(spec, pageable)
                .map(OrderMapper::toResponse);
    }

    /**
     * Create a new order
     */
    public OrderResponse create(OrderCreateRequest request) {

        String orderId = request.getId();

        // ✅ Nếu null hoặc rỗng → tự sinh UUID
        if (orderId == null || orderId.isBlank()) {
            orderId = UUID.randomUUID().toString();
        } else {
            orderId = orderId.trim();

            // ✅ CHỈ check exists khi id != null
            if (orderRepository.existsById(orderId)) {
                throw new ResourceAlreadyExistsException("Order", "id", orderId);
            }
        }

        Order order = new Order();
        order.setId(orderId);
        order.setOrderTime(request.getOrderTime());
        order.setPhoneNumber(normalizeString(request.getPhoneNumber()));
        order.setAddress(normalizeString(request.getAddress()));
        order.setNote(normalizeString(request.getNote()));
        order.setStatus(request.getStatus());

        if (request.getAccountId() != null) {
            Account account = accountRepository.findById(request.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));
            order.setAccount(account);
        }
        if (request.getPaymentId() != null && !request.getPaymentId().isBlank()) {
            Payment payment = paymentRepository.findById(request.getPaymentId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", request.getPaymentId()));
            order.setPayment(payment);
        }

        Order saved = orderRepository.save(order);
        return OrderMapper.toResponse(saved);
    }

    /**
     * Update an existing order
     */
    public OrderResponse update(String id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        order.setOrderTime(request.getOrderTime());
        order.setPhoneNumber(normalizeString(request.getPhoneNumber()));
        order.setAddress(normalizeString(request.getAddress()));
        order.setNote(normalizeString(request.getNote()));
        order.setStatus(request.getStatus());

        if (request.getAccountId() != null) {
            Account account = accountRepository.findById(request.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));
            order.setAccount(account);
        } else {
            order.setAccount(null);
        }
        if (request.getPaymentId() != null && !request.getPaymentId().isBlank()) {
            Payment payment = paymentRepository.findById(request.getPaymentId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", request.getPaymentId()));
            order.setPayment(payment);
        } else {
            order.setPayment(null);
        }

        Order saved = orderRepository.save(order);
        return OrderMapper.toResponse(saved);
    }

    /**
     * Delete an order by ID (cascade xóa cả order items)
     */
    public void delete(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        orderRepository.delete(order);
    }

    /**
     * Get order by ID (kèm orderItems và thông tin sản phẩm)
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderResponse getById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.getOrderItems().size(); // trigger lazy load
        return OrderMapper.toResponse(order);
    }

    private String normalizeId(String id) {
        return id == null ? null : id.trim();
    }

    private String normalizeString(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }

    /**
     * Update only the status of an order
     */
    public OrderResponse updateStatus(String id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        return OrderMapper.toResponse(saved);
    }


}
