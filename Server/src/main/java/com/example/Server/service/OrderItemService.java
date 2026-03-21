package com.example.Server.service;

import com.example.Server.dto.request.orderitem.*;
import com.example.Server.dto.response.orderitem.OrderItemResponse;
import com.example.Server.entity.*;
import com.example.Server.exception.*;
import com.example.Server.mapper.OrderItemMapper;
import com.example.Server.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

/** Service CRUD OrderItem (dùng cho admin). */
@Service @Transactional
public class OrderItemService {
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    public OrderItemService(OrderItemRepository orderItemRepository, OrderRepository orderRepository,
                            ProductVariantRepository productVariantRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderItemResponse> findAll(Pageable pageable, String search, String orderId, String productVariantId) {
        Specification<OrderItem> spec = (root, q, cb) -> cb.conjunction();
        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("id").as(String.class)), kw));
        }
        if (orderId != null && !orderId.isBlank())
            spec = spec.and((root, q, cb) -> cb.equal(root.get("order").get("id"), orderId.trim()));
        if (productVariantId != null && !productVariantId.isBlank())
            spec = spec.and((root, q, cb) -> cb.equal(root.get("productVariant").get("id"), productVariantId.trim()));
        return orderItemRepository.findAll(spec, pageable).map(OrderItemMapper::toResponse);
    }

    public OrderItemResponse create(OrderItemCreateRequest request) {
        String id = request.getId() == null ? null : request.getId().trim();
        if (orderItemRepository.existsById(id)) throw new ResourceAlreadyExistsException("OrderItem", "id", id);
        Order order = orderRepository.findById(request.getOrderId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));
        ProductVariant pv = productVariantRepository.findById(request.getProductVariantId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId()));
        OrderItem item = new OrderItem(); item.setId(id); item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice()); item.setOrder(order); item.setProductVariant(pv);
        return OrderItemMapper.toResponse(orderItemRepository.save(item));
    }

    public OrderItemResponse update(String id, OrderItemUpdateRequest request) {
        OrderItem item = orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", id));
        item.setQuantity(request.getQuantity()); item.setPrice(request.getPrice());
        item.setOrder(orderRepository.findById(request.getOrderId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId())));
        item.setProductVariant(productVariantRepository.findById(request.getProductVariantId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId())));
        return OrderItemMapper.toResponse(orderItemRepository.save(item));
    }

    public void delete(String id) {
        orderItemRepository.delete(orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", id)));
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderItemResponse getById(String id) {
        return OrderItemMapper.toResponse(orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", id)));
    }
}
