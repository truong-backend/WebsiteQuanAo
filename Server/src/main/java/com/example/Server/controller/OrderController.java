package com.example.Server.controller;

import com.example.Server.dto.request.order.OrderRequest;
import com.example.Server.entity.Order;
import com.example.Server.services.OrderService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Oder")
@RestController
public class OrderController {
    private final OrderService orderService;
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/all")
    public List<Order> getAllOders() {
        return orderService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveOder( OrderRequest orderRequest) {
        return orderService.Create(orderRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateOder( OrderRequest orderRequest) {
        return orderService.Update(orderRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteOder(String id) {
        return orderService.Delete(id);
    }
}
