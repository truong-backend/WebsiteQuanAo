// src/features/cart/index.ts
// Public API của cart feature — import từ '@/features/cart'

// ─── Services ────────────────────────────────────────────────
export { LocalCartService }  from './services/localCartService';
export { ServerCartService } from './services/serverCartService';
export { CartItemService }   from './services/cartItemService';

// ─── Hooks ────────────────────────────────────────────────────
export { useCart } from './hooks/useCart';

// ─── Types ────────────────────────────────────────────────────
export type { CartItem } from './services/localCartService';
export type {
  CartResponse,
  CartItemDto,
  AddToCartRequest,
  CartItemResponse,
  CartItemCreateRequest,
  CartItemUpdateRequest,
  LocalCartItem,
  CartCreateRequest,
  CartUpdateRequest,
} from './types/cart.types';

// ─── Constants ───────────────────────────────────────────────
export {
  CART_STORAGE_KEY,
  MIN_QUANTITY,
  MAX_QUANTITY,
  API_BASE_URL,
  PAY_OPTIONS,
} from './constants/cart.constants';
export type { PaymentMethod } from './constants/cart.constants';

// ─── Components ───────────────────────────────────────────────
export { default as CartPage }     from './components/CartPage';
export { default as CheckoutPage } from './components/CheckoutPage';