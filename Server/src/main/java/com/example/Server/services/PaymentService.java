package com.example.Server.services;

import com.example.Server.dto.request.payment.PaymentRequest;
import com.example.Server.entity.Payment;
import com.example.Server.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;

    PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Boolean Create(PaymentRequest paymentRequest) {
        if (!paymentRepository.existsById(paymentRequest.getId())) {
            Payment payment = new Payment();
            payment.setId(paymentRequest.getId());
            payment.setType(paymentRequest.getType());
            payment.setPayTime(paymentRequest.getPayTime());
            paymentRepository.save(payment);
            return true;
        }else{
            return false;
        }
    }

    public Boolean Update( PaymentRequest paymentRequest) {
        if (paymentRepository.existsById(paymentRequest.getId())) {
            Optional<Payment> payment = paymentRepository.findById(paymentRequest.getId());
            payment.get().setType(paymentRequest.getType());
            payment.get().setPayTime(paymentRequest.getPayTime());
            paymentRepository.save(payment.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (paymentRepository.existsById(id)) {
            paymentRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }


}



