// src/pages/Order/OrderStatusPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrderService } from "../../../Service/OrderService";
import type { OrderResponse } from "../../../type/Orders/OrderResponse";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
import Loading from "../../../Components/User/Loading/Loading";
import ErrorAlert from "../../../Components/User/ui/ErrorAlert/ErrorAlert";
import StatusChip from "../../../Components/User/ui/StatusChip/StatusChip";
import styles from "./OrderStatusPage.module.scss";

const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]   = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    OrderService.getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          {loading && <Loading />}
          {!loading && (error || !order) && <ErrorAlert message={error ?? "Không tìm thấy đơn hàng"} />}
          {!loading && order && (
            <>
              <h1 className={styles.title}>Trạng thái đơn hàng</h1>
              <div className={styles.card}>
                <p className={styles.orderId}>Mã đơn hàng</p>
                <p className={styles.orderNum}>#{order.id.slice(-10).toUpperCase()}</p>
                <p className={styles.time}>Thời gian đặt: {new Date(order.orderTime).toLocaleString("vi-VN")}</p>

                <div className={styles.statusRow}>
                  <p className={styles.statusRow__label}>Trạng thái hiện tại</p>
                  <StatusChip status={order.status} />
                </div>

                <div className={styles.divider} />

                <p className={styles.shipLabel}>Thông tin giao hàng</p>
                <p className={styles.shipInfo}>
                  SĐT: {order.phoneNumber}<br />Địa chỉ: {order.address}
                </p>
                {order.note && <p className={styles.note}>Ghi chú: {order.note}</p>}

                <div className={styles.actions}>
                  <Link className={styles.btnOutline} to={`/orders/${order.id}/invoice`}>Xem hóa đơn</Link>
                  <Link className={styles.btnText}    to="/products">Tiếp tục mua sắm</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderStatusPage;