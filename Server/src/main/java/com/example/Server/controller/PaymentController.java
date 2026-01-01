package com.example.Server.controller;


import com.example.Server.dto.request.Payment.PaymentRequest;
import com.example.Server.dto.request.color.ColorRequest;
import com.example.Server.entity.Color;
import com.example.Server.entity.Payment;
import com.example.Server.services.PaymentService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/payment")
@RestController
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/all")
    public List<Payment> getAllPayments() {
        return paymentService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean savePayment( PaymentRequest paymentRequest) {
        return paymentService.Create(paymentRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updatePayment( PaymentRequest color) {
        return paymentService.Update(color);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deletePayment(String id) {
        return paymentService.Delete(id);
    }
}
