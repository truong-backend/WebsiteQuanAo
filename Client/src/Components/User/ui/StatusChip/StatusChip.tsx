// src/Components/User/ui/StatusChip/StatusChip.tsx
import { OrderStatus, OrderStatusLabels } from "../../../../type/Orders/OrderStatus";
import styles from "./StatusChip.module.scss";

const STATUS_VARIANT: Record<string, string> = {
  PENDING: "warning", PROCESSING: "info", SHIPPED: "info",
  DELIVERED: "success", CANCELLED: "error",
};

interface StatusChipProps { 
  status: OrderStatus; 
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => (
  <span className={`${styles.chip} ${styles[`chip--${STATUS_VARIANT[status] ?? "default"}`]}`}>
    {OrderStatusLabels[status] ?? status}
  </span>
);
export default StatusChip;