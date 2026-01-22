package com.example.Server.controller;

import com.example.Server.dto.request.payment.PaymentCreateRequest;
import com.example.Server.dto.request.payment.PaymentUpdateRequest;
import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.services.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * REST Controller for Payment management
 * Base path: /payments
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "type",
            "payTime"
    );

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Get paginated payments with filter and search
     * GET /payments
     */
    @GetMapping
    public ResponseEntity<Page<PaymentResponse>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                paymentService.findAll(pageable, search)
        );
    }

    /**
     * Create payment
     * POST /payments
     */
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paymentService.create(request));
    }

    /**
     * Update payment
     * PUT /payments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(
            @PathVariable String id,
            @Valid @RequestBody PaymentUpdateRequest request
    ) {
        return ResponseEntity.ok(
                paymentService.update(id, request)
        );
    }

    /**
     * Delete payment
     * DELETE /payments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

    /**
     * Get payment by id
     * GET /payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                paymentService.getById(id)
        );
    }
}
