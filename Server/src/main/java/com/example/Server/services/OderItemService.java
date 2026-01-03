package com.example.Server.services;

import com.example.Server.dto.request.order.OrderRequest;
import com.example.Server.dto.request.orderItem.OderItemRequest;
import com.example.Server.entity.Order;
import com.example.Server.entity.OrderItem;
import com.example.Server.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OderItemService {
    private final OrderItemRepository orderItemRepository;


    public OderItemService(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    public List<OrderItem> findAll() {
        return orderItemRepository.findAll();
    }

    public Boolean Create(OderItemRequest oderItemRequest) {
        if (!orderItemRepository.existsById(oderItemRequest.getId())) {
            OrderItem orderItem = new OrderItem();
            orderItem.setId(oderItemRequest.getId());
            orderItem.setQuantity(oderItemRequest.getQuantity());
            orderItem.setPrice(oderItemRequest.getPrice());
            orderItemRepository.save(orderItem);
            return true;
        }else{
            return false;
        }
    }

    public Boolean  Update( OderItemRequest oderItemRequest) {
        if (orderItemRepository.existsById(oderItemRequest.getId())) {
            Optional<OrderItem> order = orderItemRepository.findById(oderItemRequest.getId());
            order.get().setId(oderItemRequest.getId());
            order.get().setQuantity(oderItemRequest.getQuantity());
            order.get().setPrice(oderItemRequest.getPrice());
            orderItemRepository.save(order.get());
            return true;
        }else{
            return false;
        }
    }

    public Boolean Delete(String id) {
        if (orderItemRepository.existsById(id)) {
            orderItemRepository.deleteById(id);
            return true;
        }else{
            return false;
        }
    }
}
