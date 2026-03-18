// src/pages/Order/OrderInvoicePage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { OrderService } from "../../../Service/OrderService";
import type { OrderResponse } from "../../../type/Orders/OrderResponse";
import { OrderStatusLabels } from "../../../type/Orders/OrderStatus";
import Loading from "../../../Components/User/Loading/Loading";
import ErrorAlert from "../../../Components/User/ui/ErrorAlert/ErrorAlert";
import styles from "./OrderInvoicePage.module.scss";

const OrderInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]     = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    OrderService.getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải hóa đơn"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.page}><div className={styles.container}><Loading /></div></div>;
  if (error || !order) return <div className={styles.page}><div className={styles.container}><ErrorAlert message={error ?? "Không tìm thấy hóa đơn"} /></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Hóa đơn mua hàng</h1>
            <button className={styles.printBtn} onClick={() => window.print()}>🖨 In hóa đơn</button>
          </div>
          <div className={styles.divider} />
          <p className={styles.meta}>Mã đơn hàng: <strong>#{order.id.slice(-10).toUpperCase()}</strong></p>
          <p className={styles.meta}>Thời gian đặt: <strong>{new Date(order.orderTime).toLocaleString("vi-VN")}</strong></p>
          <p className={styles.meta}>Trạng thái: <strong>{OrderStatusLabels[order.status]}</strong></p>
          <div className={styles.divider} />
          <p className={styles.section}>Thông tin khách hàng</p>
          <p className={styles.info}>SĐT: {order.phoneNumber}<br />Địa chỉ: {order.address}</p>
          {order.note && (
            <>
              <div className={styles.divider} />
              <p className={styles.section}>Ghi chú</p>
              <p className={styles.info}>{order.note}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderInvoicePage;