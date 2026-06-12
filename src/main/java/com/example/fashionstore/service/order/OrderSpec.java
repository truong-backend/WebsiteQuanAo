package com.example.fashionstore.service.order;

import com.example.fashionstore.dto.order.OrderFilterDto;
import com.example.fashionstore.module.order.Order;
import org.springframework.data.jpa.domain.Specification;

public class OrderSpec {

    public static Specification<Order> build(OrderFilterDto filter) {
        Specification<Order> spec = Specification.where(null);

        if (filter == null) return spec;

        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                Order.OrderStatus status = Order.OrderStatus.valueOf(filter.getStatus().toUpperCase());
                spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), status));
            } catch (IllegalArgumentException ignored) {}
        }

        if (filter.getUserId() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("user").get("id"), filter.getUserId()));
        }

        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            String kw = "%" + filter.getSearch().trim() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(root.get("id"), kw),
                    cb.like(root.get("phoneNumber"), kw)
            ));
        }

        return spec;
    }
}