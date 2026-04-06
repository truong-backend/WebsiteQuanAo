// src/features/products/constants/product.constants.ts
// Tập trung các giá trị magic từ useProductListing + ProductDetailPage

// ─── API / image base ─────────────────────────────────────────
// Nên chuyển sang env var: import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = 'http://localhost:8080';

// ─── Listing page ─────────────────────────────────────────────
export const LISTING_PAGE_SIZE    = 12;
export const DEFAULT_MIN_PRICE    = 0;
export const DEFAULT_MAX_PRICE    = 10_000_000;
export const TOAST_DURATION_MS    = 2500;

// ─── Sort options ─────────────────────────────────────────────
export type SortBy  = 'price' | 'name' | 'createdAt';
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_BY:  SortBy  = 'price';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

// ─── Fallback image ───────────────────────────────────────────
export const FALLBACK_IMG = 'https://via.placeholder.com/300?text=No+Image';