package com.example.Server.services;

import com.example.Server.dto.request.payment.PaymentCreateRequest;
import com.example.Server.dto.request.payment.PaymentUpdateRequest;
import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.entity.Payment;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.PaymentMapper;
import com.example.Server.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Find all payments with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<PaymentResponse> findAll(
            Pageable pageable,
            String search
    ) {
        Specification<Payment> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";

            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("id").as(String.class)), keyword),
                            cb.like(cb.lower(root.get("type").as(String.class)), keyword)
                    )
            );
        }

        return paymentRepository
                .findAll(spec, pageable)
                .map(PaymentMapper::toResponse);
    }


    /**
     * Create a new payment
     */
    public PaymentResponse create(PaymentCreateRequest request) {
        String paymentId = normalizeId(request.getId());

        if (paymentRepository.existsById(paymentId)) {
            throw new ResourceAlreadyExistsException(
                    "Payment",
                    "id",
                    paymentId
            );
        }

        Payment payment = new Payment();
        payment.setId(paymentId);
        payment.setType(request.getType());
        payment.setPayTime(request.getPayTime());

        Payment saved = paymentRepository.save(payment);
        return PaymentMapper.toResponse(saved);
    }

    /**
     * Update an existing payment
     */
    public PaymentResponse update(String id, PaymentUpdateRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment",
                        "id",
                        id
                ));

        payment.setType(request.getType());
        payment.setPayTime(request.getPayTime());

        Payment saved = paymentRepository.save(payment);
        return PaymentMapper.toResponse(saved);
    }

    /**
     * Delete a payment by ID
     */
    public void delete(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment", "id", id)
                );

        if (payment.getOrder() != null) {
            throw new InvalidOperationException(
                    "Cannot delete payment that is associated with an order. Please remove or reassign the order first."
            );
        }

        paymentRepository.delete(payment);
    }

    /**
     * Get payment by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public PaymentResponse getById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment", "id", id)
                );
        return PaymentMapper.toResponse(payment);
    }

    /**
     * Normalize payment ID (trim)
     */
    private String normalizeId(String id) {
        return id == null ? null : id.trim();
    }
}
