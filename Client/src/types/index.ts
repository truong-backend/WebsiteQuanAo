// ─────────────────────────────────────────────────────────────
//  types/index.ts
//  Import mọi type từ 1 chỗ duy nhất:
//    import type { OrderResponse, CartItem, ProductFilter } from "@/types";
// ─────────────────────────────────────────────────────────────

export type * from "./auth/auth.types";
export type * from "./account/account.types";
export type * from "./category/category.types";
export type * from "./color/color.types";
export type * from "./size/size.types";
export type * from "./product/product.types";
export type * from "./productVariant/productVariant.types";
export type * from "./cart/cart.types";
export type * from "./order/order.types";
export type * from "./payment/payment.types";
export type * from "./common/common.types";
export type * from "./contact/contact.types";

// // ─── Re-export const enums (không dùng `export type *`) ───────
export { OrderStatus, OrderStatusLabels, OrderStatusColors } from "./order/order.types";
export { PaymentType }                                       from "./payment/payment.types";
export { ContactStatusLabels, ContactStatusColors }           from "./contact/contact.types";
