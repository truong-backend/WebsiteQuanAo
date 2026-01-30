export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.SHIPPING]: "Đang giao hàng",
  [OrderStatus.COMPLETED]: "Hoàn thành",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800",
  [OrderStatus.SHIPPING]: "bg-purple-100 text-purple-800",
  [OrderStatus.COMPLETED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};