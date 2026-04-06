// src/components/user/ui/StatusChip.tsx
// Chịu trách nhiệm: Badge trạng thái đơn hàng với màu tương ứng
import {
  OrderStatus,
  OrderStatusLabels,
} from "@/features/user/orders/types/order.types";
import styles from "./StatusChip.module.scss";

const STATUS_VARIANT: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPING: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};

interface StatusChipProps {
  status: OrderStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => (
  <span
    className={`${styles.chip} ${styles[`chip--${STATUS_VARIANT[status] ?? "default"}`]}`}
  >
    {OrderStatusLabels[status] ?? status}
  </span>
);

export default StatusChip;
