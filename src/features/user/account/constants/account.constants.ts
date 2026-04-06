// ─── Role labels ──────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Quản trị viên",
  ROLE_USER: "Khách hàng",
};

import { OrderStatus } from "@/features/user/orders/types/order.types";

export const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; cssClass: string }
> = {
  [OrderStatus.PENDING]: { label: "Chờ xử lý", cssClass: "pending" },
  [OrderStatus.CONFIRMED]: { label: "Đã xác nhận", cssClass: "confirmed" },
  [OrderStatus.SHIPPING]: { label: "Đang giao", cssClass: "shipped" },
  [OrderStatus.COMPLETED]: { label: "Hoàn thành", cssClass: "delivered" },
  [OrderStatus.CANCELLED]: { label: "Đã hủy", cssClass: "cancelled" },
};

// ─── Primary statuses (dùng để quyết định btn style) ─────────
export const PRIMARY_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];
