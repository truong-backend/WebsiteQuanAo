package com.example.Server.dto.response.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO trả về cho Navbar — fetch 1 lần duy nhất
 * Cấu trúc: root category + danh sách children
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavbarCategoryResponse {
    private Long categoryId;
    private String categoryName;
    private List<NavbarCategoryResponse> children;
}