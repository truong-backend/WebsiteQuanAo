package com.example.fashionstore.service.product;

import com.example.fashionstore.dto.product.ProductFilterDto;
import com.example.fashionstore.module.category.Category;
import com.example.fashionstore.module.product.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpec {

    // ================= STORE (USER) =================

    public static Specification<Product> build(ProductFilterDto filter) {
        Specification<Product> spec = Specification.where(isActive());

        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            String kw = "%" + filter.getSearch().trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
            ));
        }

        if (filter.getCategoryId() != null) {
            spec = spec.and(inCategoryOrChildren(filter.getCategoryId()));
        }

        if (filter.getMinPrice() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.greaterThanOrEqualTo(root.get("basePrice"), filter.getMinPrice())
            );
        }

        if (filter.getMaxPrice() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.lessThanOrEqualTo(root.get("basePrice"), filter.getMaxPrice())
            );
        }

        if (filter.getColorCode() != null) {
            spec = spec.and((root, q, cb) -> {
                var variants = root.join("variants");
                return cb.equal(variants.get("color").get("code"), filter.getColorCode());
            });
        }

        if (filter.getSizeCode() != null) {
            spec = spec.and((root, q, cb) -> {
                var variants = root.join("variants");
                return cb.equal(variants.get("size").get("code"), filter.getSizeCode());
            });
        }

        return spec;
    }

    // ================= ADMIN =================

    public static Specification<Product> buildAdmin(ProductFilterDto filter) {
        Specification<Product> spec = Specification.where(null); // KHÔNG filter deleted

        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            String kw = "%" + filter.getSearch().trim().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
            ));
        }

        if (filter.getCategoryId() != null) {
            spec = spec.and(inCategoryOrChildren(filter.getCategoryId()));
        }

        if (filter.getMinPrice() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.greaterThanOrEqualTo(root.get("basePrice"), filter.getMinPrice())
            );
        }

        if (filter.getMaxPrice() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.lessThanOrEqualTo(root.get("basePrice"), filter.getMaxPrice())
            );
        }

        if (filter.getColorCode() != null) {
            spec = spec.and((root, q, cb) -> {
                var variants = root.join("variants");
                return cb.equal(variants.get("color").get("code"), filter.getColorCode());
            });
        }

        if (filter.getSizeCode() != null) {
            spec = spec.and((root, q, cb) -> {
                var variants = root.join("variants");
                return cb.equal(variants.get("size").get("code"), filter.getSizeCode());
            });
        }

        return spec;
    }

    // ================= BASE FILTER =================

    // Store: active + chưa xóa
    private static Specification<Product> isActive() {
        return (root, q, cb) -> cb.and(
                cb.isTrue(root.get("active")),
                cb.isFalse(root.get("deleted"))
        );
    }

    /**
     * Lọc sản phẩm thuộc danh mục {@code categoryId} HOẶC bất kỳ danh mục con nào của nó.
     * Hỗ trợ cấu trúc 2 cấp (root → children).
     */
    private static Specification<Product> inCategoryOrChildren(Long categoryId) {
        return (root, query, cb) -> {
            // Subquery: id các danh mục con có parent_category_id = categoryId
            var subquery = query.subquery(Long.class);
            var catRoot  = subquery.from(Category.class);
            subquery.select(catRoot.get("categoryId"))
                    .where(cb.equal(
                            catRoot.get("parentCategory").get("categoryId"),
                            categoryId
                    ));

            var catId = root.get("category").get("categoryId");

            // category_id = :categoryId  OR  category_id IN (subquery)
            return cb.or(
                    cb.equal(catId, categoryId),
                    catId.in(subquery)
            );
        };
    }
}