// src/features/categories/index.ts
// Public API của categories feature — import từ '@/features/categories'

// ─── API ─────────────────────────────────────────────────────
export { categoryApi } from './api/categoryApi';

// ─── Types ───────────────────────────────────────────────────
export type {
  CategoryResponse,
  CategoryResponsePageResponse,
  CategoryCreateAndUpdateRequest,
  CategoryOption,
  NavbarCategory,
} from './types/category.types';

// ─── Services ────────────────────────────────────────────────
export { CategoryService } from './services/categoryService';