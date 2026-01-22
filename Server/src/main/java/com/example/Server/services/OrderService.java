package com.example.Server.services;

import com.example.Server.dto.request.order.OrderCreateRequest;
import com.example.Server.dto.request.order.OrderUpdateRequest;
import com.example.Server.dto.response.order.OrderResponse;
import com.example.Server.entity.Account;
import com.example.Server.entity.Order;
import com.example.Server.entity.Payment;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.OrderMapper;
import com.example.Server.repository.AccountRepository;
import com.example.Server.repository.OrderItemRepository;
import com.example.Server.repository.OrderRepository;
import com.example.Server.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            AccountRepository accountRepository,
            PaymentRepository paymentRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.orderItemRepository = orderItemRepository;
    }

    /**
     * Find all orders with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderResponse> findAll(Pageable pageable, String search) {
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

        return orderRepository
                .findAll(spec, pageable)
                .map(OrderMapper::toResponse);
    }

    /**
     * Create a new order
     */
    public OrderResponse create(OrderCreateRequest request) {
        String orderId = normalizeId(request.getId());

        if (orderRepository.existsById(orderId)) {
            throw new ResourceAlreadyExistsException("Order", "id", orderId);
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
     * Delete an order by ID
     */
    public void delete(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        if (orderItemRepository.existsByOrder_Id(id)) {
            throw new InvalidOperationException(
                    "Cannot delete order that has order items. Please remove order items first."
            );
        }

        orderRepository.delete(order);
    }

    /**
     * Get order by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderResponse getById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return OrderMapper.toResponse(order);
    }

    private String normalizeId(String id) {
        return id == null ? null : id.trim();
    }

    private String normalizeString(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }
}
