package com.example.Server.mapper;

import com.example.Server.dto.response.payment.PaymentResponse;
import com.example.Server.entity.Payment;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PaymentMapper {
    public static PaymentResponse toResponse(Payment p) {
        if (p == null) return null;
        PaymentResponse r = new PaymentResponse();
        r.setId(p.getId());
        r.setType(p.getType());
        r.setPayTime(p.getPayTime());
        return r;
    }
    public static List<PaymentResponse> toResponses(List<Payment> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(PaymentMapper::toResponse).collect(Collectors.toList());
    }
}
