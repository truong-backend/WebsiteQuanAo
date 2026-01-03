package com.example.Server.services;

import com.example.Server.dto.request.order.OrderRequest;
import com.example.Server.entity.Order;
import com.example.Server.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;


    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Boolean Create(OrderRequest orderRequest) {
        if (!orderRepository.existsById(orderRequest.getId())) {
            Order order = new Order();
            order.setId(orderRequest.getId());
            order.setOrderTime(orderRequest.getOrderTime());
            order.setPhoneNumber(orderRequest.getPhoneNumber());
            order.setAddress(orderRequest.getAddress());
            order.setNote(orderRequest.getNote());
            order.setStatus(orderRequest.getStatus());
            orderRepository.save(order);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( OrderRequest orderRequest) {
        if (orderRepository.existsById(orderRequest.getId())) {
            Optional<Order> order = orderRepository.findById(orderRequest.getId());
            order.get().setId(orderRequest.getId());
            order.get().setOrderTime(orderRequest.getOrderTime());
            order.get().setPhoneNumber(orderRequest.getPhoneNumber());
            order.get().setAddress(orderRequest.getAddress());
            order.get().setNote(orderRequest.getNote());
            order.get().setStatus(orderRequest.getStatus());
            orderRepository.save(order.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
