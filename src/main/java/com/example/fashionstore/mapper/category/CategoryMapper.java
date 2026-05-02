package com.example.fashionstore.mapper.category;

import com.example.fashionstore.dto.category.CategoryDto;
import com.example.fashionstore.module.category.Category;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CategoryMapper — Tree Structure (DFS)
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TREE — cấu trúc cây:                                            ║
 * ║  Category là cây n-ary: 1 node cha, nhiều node con             ║
 * ║  Ví dụ:                                                          ║
 * ║       Thời trang nam (root)                                      ║
 * ║       ├── Áo (child)                                            ║
 * ║       │   ├── Áo thun                                           ║
 * ║       │   └── Áo sơ mi                                          ║
 * ║       └── Quần (child)                                          ║
 * ║                                                                  ║
 * ║  DFS (Depth First Search) — Tìm kiếm theo chiều sâu:            ║
 * ║  toDto() gọi toChildDto() → duyệt hết con của 1 node trước     ║
 * ║  khi sang node khác (đi sâu trước, rộng sau)                   ║
 * ║                                                                  ║
 * ║  TRÁNH CIRCULAR REFERENCE:                                       ║
 * ║  toDto()      → map children bằng toChildDto()                  ║
 * ║  toChildDto() → KHÔNG map children nữa (dừng đệ quy)           ║
 * ║  Nếu toDto() gọi lại toDto() cho child → StackOverflow!         ║
 * ║  (STACK tràn vì đệ quy vô hạn, mỗi lần gọi push frame vào STACK)║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  SINGLETON: @Component → Spring tạo 1 instance, inject mọi nơi  ║
 * ║                                                                  ║
 * ║  SOLID:                                                          ║
 * ║  S: CategoryMapper chỉ làm 1 việc: convert Category ↔ DTO      ║
 * ║  D: Service inject CategoryMapper (không new trực tiếp)         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
@Component
public class CategoryMapper {

    /**
     * Convert Entity → DTO
     * DFS: duyệt 1 cấp con (shallow), không đệ quy sâu hơn
     * để tránh N+1 query và StackOverflow
     */
    public CategoryDto toDto(Category category) {
        if (category == null) return null;

        // Duyệt children: DFS 1 cấp — map từng child bằng toChildDto()
        List<CategoryDto> children = Collections.emptyList();
        if (category.getChildCategories() != null) {
            children = category.getChildCategories().stream()
                    .map(this::toChildDto)   // DFS: đi vào từng child
                    .collect(Collectors.toList());
        }

        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .parentCategoryId(
                        category.getParentCategory() != null
                                ? category.getParentCategory().getCategoryId()
                                : null
                )
                .deleted(category.isDeleted())
                .deletedAt(category.getDeletedAt())
                .childCategories(children)
                .build();
    }

    /**
     * Convert child entity → DTO KHÔNG có childCategories
     * Dừng đệ quy tại đây — tránh StackOverflow
     *
     * STACK memory: mỗi lần gọi method → push 1 frame lên call stack
     * Đệ quy vô hạn → STACK OVERFLOW (hết bộ nhớ stack)
     * Fix: toChildDto() không gọi lại toDto() → chuỗi đệ quy kết thúc
     */
    private CategoryDto toChildDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .deleted(category.isDeleted())
                .deletedAt(category.getDeletedAt())
                .parentCategoryId(
                        category.getParentCategory() != null
                                ? category.getParentCategory().getCategoryId()
                                : null
                )
                .childCategories(Collections.emptyList()) // dừng DFS tại đây
                .build();
    }

    /**
     * toDtoList — BFS variant: map từng root category tuần tự
     * LinkedList thích hợp cho BFS (queue: poll/offer O(1))
     * ArrayList thích hợp cho DFS (stack: push/pop O(1) cuối)
     * Ở đây dùng stream() collect → ArrayList ngầm định
     */
    public List<CategoryDto> toDtoList(List<Category> categories) {
        if (categories == null) return Collections.emptyList();
        return categories.stream().map(this::toDto).collect(Collectors.toList());
    }
}