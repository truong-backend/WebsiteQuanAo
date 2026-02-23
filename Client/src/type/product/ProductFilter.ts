export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}