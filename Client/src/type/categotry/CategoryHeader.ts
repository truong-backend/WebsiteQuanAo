// src/type/category/CategoryHeader.ts

/**
 * Category header response DTO
 * Used for tree structure and hierarchical display
 * Includes recursive children for nested categories
 */
export interface CategoryHeader {
  categoryId: number;
  categoryName: string;
  children: CategoryHeader[];  // Always present, empty array if no children
}