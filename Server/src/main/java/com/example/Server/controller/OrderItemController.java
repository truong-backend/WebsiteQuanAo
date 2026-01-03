package com.example.Server.controller;

import com.example.Server.dto.request.order.OrderRequest;
import com.example.Server.dto.request.orderItem.OderItemRequest;
import com.example.Server.entity.Order;
import com.example.Server.entity.OrderItem;
import com.example.Server.services.OderItemService;
import com.example.Server.services.OrderService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/OderItem")
@RestController
public class OrderItemController {
    private final OderItemService oderItemService;
    public OrderItemController(OderItemService oderItemService) {
        this.oderItemService = oderItemService;
    }

    @GetMapping("/all")
    public List<OrderItem> getAllOderItems() {
        return oderItemService.findAll();
    }

    @Transactional
    @PostMapping("/save")
    public Boolean saveOderItem( OderItemRequest oderItemRequest) {
        return oderItemService.Create(oderItemRequest);
    }

    @Transactional
    @PutMapping("/update")
    public Boolean updateOderItem( OderItemRequest oderItemRequest) {
        return oderItemService.Update(oderItemRequest);
    }
    @Transactional
    @DeleteMapping("/delete")
    public Boolean deleteOderItem(String id) {
        return oderItemService.Delete(id);
    }
}
