// src/features/cart/constants/cart.constants.ts

// ─── localStorage key ─────────────────────────────────────────
// Tập trung thay vì hard-code 'cart_items' trong localCartService
export const CART_STORAGE_KEY = 'cart_items';

// ─── Quantity limits ──────────────────────────────────────────
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

// ─── Image base (dùng trong CartPage) ────────────────────────
// Nên chuyển sang import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = 'http://localhost:8080';

// ─── Fallback image ───────────────────────────────────────────
export const FALLBACK_IMG = 'https://via.placeholder.com/80';

// ─── Payment method options (dùng trong CheckoutPage) ─────────
export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO';

export const PAY_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'COD',   label: 'Thanh toán khi nhận hàng' },
  { value: 'VNPAY', label: 'VNPAY' },
  { value: 'MOMO',  label: 'MoMo' },
];