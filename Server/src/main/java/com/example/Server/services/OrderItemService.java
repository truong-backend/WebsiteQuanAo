package com.example.Server.services;

import com.example.Server.dto.request.orderItem.OrderItemCreateRequest;
import com.example.Server.dto.request.orderItem.OrderItemUpdateRequest;
import com.example.Server.dto.response.orderItem.OrderItemResponse;
import com.example.Server.entity.Order;
import com.example.Server.entity.OrderItem;
import com.example.Server.entity.ProductVariant;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.OrderItemMapper;
import com.example.Server.repository.OrderItemRepository;
import com.example.Server.repository.OrderRepository;
import com.example.Server.repository.ProductVariantRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository,
            ProductVariantRepository productVariantRepository
    ) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<OrderItemResponse> findAll(Pageable pageable, String search, String orderId, String productVariantId) {
        Specification<OrderItem> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("id").as(String.class)), keyword)
            );
        }
        if (orderId != null && !orderId.isBlank()) {
            String oid = orderId.trim();
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("order").get("id"), oid)
            );
        }
        if (productVariantId != null && !productVariantId.isBlank()) {
            String pvid = productVariantId.trim();
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("productVariant").get("id"), pvid)
            );
        }

        return orderItemRepository.findAll(spec, pageable).map(OrderItemMapper::toResponse);
    }

    public OrderItemResponse create(OrderItemCreateRequest request) {
        String id = normalizeId(request.getId());
        if (orderItemRepository.existsById(id)) {
            throw new ResourceAlreadyExistsException("OrderItem", "id", id);
        }

        Order order = orderRepository.findById(request.getOrderId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));
        ProductVariant pv = productVariantRepository.findById(request.getProductVariantId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId()));

        OrderItem item = new OrderItem();
        item.setId(id);
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setOrder(order);
        item.setProductVariant(pv);

        OrderItem saved = orderItemRepository.save(item);
        return OrderItemMapper.toResponse(saved);
    }

    public OrderItemResponse update(String id, OrderItemUpdateRequest request) {
        OrderItem item = orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", id));

        Order order = orderRepository.findById(request.getOrderId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));
        ProductVariant pv = productVariantRepository.findById(request.getProductVariantId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getProductVariantId()));

        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setOrder(order);
        item.setProductVariant(pv);

        OrderItem saved = orderItemRepository.save(item);
        return OrderItemMapper.toResponse(saved);
    }

    public void delete(String id) {
        OrderItem item = orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", id));
        orderItemRepository.delete(item);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public OrderItemResponse getById(String id) {
        OrderItem item = orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", id));
        return OrderItemMapper.toResponse(item);
    }

    private String normalizeId(String s) {
        return s == null ? null : s.trim();
    }
}
