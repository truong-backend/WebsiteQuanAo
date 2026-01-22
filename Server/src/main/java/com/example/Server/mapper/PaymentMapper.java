package com.example.Server.mapper;

import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.entity.Payment;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Payment entity and its DTOs
 */
public class PaymentMapper {

    /**
     * Convert Payment entity to PaymentResponse
     */
    public static PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setType(payment.getType());
        response.setPayTime(payment.getPayTime());

        return response;
    }

    /**
     * Convert list of Payment entities to list of PaymentResponse
     */
    public static List<PaymentResponse> toResponses(List<Payment> payments) {
        if (payments == null) {
            return Collections.emptyList();
        }

        return payments.stream()
                .map(PaymentMapper::toResponse)
                .collect(Collectors.toList());
    }

}
