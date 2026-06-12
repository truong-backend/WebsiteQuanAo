import type { OrderDto, OrderStatus } from '@shared/types'

export type { OrderDto, OrderStatus }

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING:  'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REFUNDED:  'Hoàn tiền',
}

export const ORDER_STATUS_VARIANT: Record<OrderStatus, 'default' | 'gold' | 'success' | 'error' | 'warning'> = {
  PENDING:   'warning',
  CONFIRMED: 'gold',
  SHIPPING:  'gold',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  REFUNDED:  'default',
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD:   'Thanh toán khi nhận hàng',
  VNPAY: 'VNPay',
}

export function canCancelOrder(order: Pick<OrderDto, 'status'>): boolean {
  return order.status === 'PENDING'
}