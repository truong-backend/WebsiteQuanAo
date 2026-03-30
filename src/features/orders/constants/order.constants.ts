// src/features/orders/constants/order.constants.ts

import { OrderStatus } from '../types/order.types';
import { PaymentType }  from '../types/payment.types';

// ─── OrderStatus display config ───────────────────────────────
// Dùng thay cho hard-code trong OrderHistoryPage / StatusChip
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; tailwind: string }
> = {
  [OrderStatus.PENDING]:   { label: 'Chờ xác nhận',  badgeClass: 'pending',   tailwind: 'bg-yellow-100 text-yellow-800' },
  [OrderStatus.CONFIRMED]: { label: 'Đã xác nhận',   badgeClass: 'confirmed', tailwind: 'bg-blue-100 text-blue-800'   },
  [OrderStatus.SHIPPING]:  { label: 'Đang giao hàng',badgeClass: 'shipped',   tailwind: 'bg-purple-100 text-purple-800'},
  [OrderStatus.COMPLETED]: { label: 'Hoàn thành',    badgeClass: 'delivered', tailwind: 'bg-green-100 text-green-800' },
  [OrderStatus.CANCELLED]: { label: 'Đã hủy',        badgeClass: 'cancelled', tailwind: 'bg-red-100 text-red-800'     },
};

// ─── Stepper fill widths theo trạng thái ─────────────────────
// Dùng trong OrderTrackingPage stepper (hiện hard-code 66%)
export const STEPPER_FILL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:   '0%',
  [OrderStatus.CONFIRMED]: '33%',
  [OrderStatus.SHIPPING]:  '66%',
  [OrderStatus.COMPLETED]: '100%',
  [OrderStatus.CANCELLED]: '0%',
};

// ─── Payment type labels ──────────────────────────────────────
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.CASH]:          'Tiền mặt',
  [PaymentType.BANK_TRANSFER]: 'Chuyển khoản',
  [PaymentType.MOMO]:          'MoMo',
  [PaymentType.VNPAY]:         'VNPAY',
};

// ─── Pagination defaults ──────────────────────────────────────
export const ORDER_PAGE_SIZE = 10;

// ─── VNPAY success response code ─────────────────────────────
export const VNPAY_SUCCESS_CODE = '00';