package com.example.Server.controller;


import com.example.Server.dto.request.Payment.PaymentRequest;
import com.example.Server.dto.request.size.SizeRequest;
import com.example.Server.entity.Payment;
import com.example.Server.entity.Size;
import com.example.Server.services.SizeService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Size")
@RestController
public class SizeController {
    private final SizeService sizeService;

    public SizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    @GetMapping("/all")
    public List<Size> getAllPayments() {
        return sizeService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean savePayment( SizeRequest sizeRequest) {
        return sizeService.Create(sizeRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updatePayment( SizeRequest sizeRequest) {
        return sizeService.Update(sizeRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deletePayment(String id) {
        return sizeService.Delete(id);
    }
}
