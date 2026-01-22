// src/type/category/CategoryOption.ts

/**
 * Category option DTO
 * Used for dropdowns, select inputs, and simple listings
 * Contains only essential fields (id and name)
 */
export interface CategoryOption {
  categoryId: number;
  categoryName: string;
}