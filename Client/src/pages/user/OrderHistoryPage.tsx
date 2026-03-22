// src/pages/user/OrderHistoryPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "@/components/user/layout/ProfileLayout";
import { AccountService } from "@/modules";
import type { OrderBasicResponse } from "@/types";
import { OrderStatus, OrderStatusLabels } from "@/types";
import styles from "./OrderHistoryPage.module.scss";

// ─── Helpers ──────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "long", year: "numeric",
  });

// const formatCurrency = (amount?: number) =>
//   amount != null
//     ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
//     : "—";

// Map OrderStatus → badge class
const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  [OrderStatus.PENDING]:   { label: "Chờ xử lý",  cls: styles.pending   },
  [OrderStatus.CONFIRMED]: { label: "Đã xác nhận", cls: styles.confirmed },
  [OrderStatus.SHIPPING]:  { label: "Đang giao",   cls: styles.shipped   },
  [OrderStatus.COMPLETED]: { label: "Hoàn thành",  cls: styles.delivered },
  [OrderStatus.CANCELLED]: { label: "Đã hủy",      cls: styles.cancelled },
};

// ─── Empty state ──────────────────────────────────────────────

const EmptyOrders: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyState__text}>Bạn chưa có đơn hàng nào.</p>
      <button className={styles.btnPrimary} onClick={() => navigate("/products")}>
        Khám phá sản phẩm
      </button>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────

const OrderSkeleton: React.FC = () => (
  <div className={styles.ordersList}>
    {[1, 2, 3].map((i) => (
      <div key={i} className={styles.orderCard}>
        <div className={styles.orderLeft}>
          <div className={`${styles.orderThumb} ${styles['orderThumb--skeleton']}`} />
          <div className={styles.orderInfo__skeleton}>
            <div className={styles.skeletonLine} style={{ width: "6rem" }} />
            <div className={styles.skeletonLine} style={{ width: "14rem" }} />
            <div className={styles.skeletonLine} style={{ width: "9rem" }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Order card ───────────────────────────────────────────────

interface OrderCardProps {
  order: OrderBasicResponse;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const badge    = STATUS_BADGE[order.status] ?? { label: order.status, cls: "" };
  const isPrimary = order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

  const itemCount = order.orderItems?.length ?? 0;

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderLeft}>
        <div className={styles.orderThumb}>
          {/* Placeholder — variant không có ảnh trong OrderBasicResponse */}
          <div className={styles.orderThumb__placeholder}>
            <span className={styles.orderThumb__count}>
              {itemCount > 0 ? `${itemCount} SP` : "—"}
            </span>
          </div>
        </div>

        <div className={styles.orderInfo}>
          <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
          <h3>
            {itemCount > 0 ? `${itemCount} sản phẩm` : "Đơn hàng"}
          </h3>
          <p className={styles.orderDate}>
            Đặt lúc {formatDate(order.orderTime as unknown as string)}
          </p>
          {order.address && (
            <p className={styles.orderAddress}>{order.address}</p>
          )}
        </div>
      </div>

      <div className={styles.orderRight}>
        <div className={styles.orderMeta}>
          <p className={styles.metaLabel}>Trạng thái</p>
          <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
        </div>

        <button
          className={isPrimary ? styles.btnPrimary : styles.btnOutline}
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders]   = useState<OrderBasicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState<OrderStatus | "">("");

  useEffect(() => {
    AccountService.getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? orders.filter((o) => o.status === filter)
    : orders;

  return (
    <ProfileLayout>
      <div className={styles.page}>
        <section className={styles.content}>
          <div className={styles.inner}>

            {/* ── Header ── */}
            <div className={styles.pageHeader}>
              <div>
                <h1>Lịch sử đơn hàng</h1>
                <p>Theo dõi và quản lý các đơn hàng của bạn.</p>
              </div>
              {!loading && orders.length > 0 && (
                <div className={styles.filterRow}>
                  {(["", ...Object.values(OrderStatus)] as (OrderStatus | "")[]).map((s) => (
                    <button
                      key={s}
                      className={[
                        styles.filterBtn,
                        filter === s ? styles["filterBtn--active"] : "",
                      ].join(" ")}
                      onClick={() => setFilter(s)}
                    >
                      {s === "" ? "Tất cả" : OrderStatusLabels[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Content ── */}
            {loading && <OrderSkeleton />}

            {error && (
              <div className={styles.errorState}>
                <p>{error}</p>
                <button className={styles.btnOutline} onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              filter ? (
                <p className={styles.emptyFilter}>
                  Không có đơn hàng nào ở trạng thái này.
                </p>
              ) : (
                <EmptyOrders />
              )
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className={styles.ordersList}>
                {filtered.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

          </div>
        </section>
      </div>
    </ProfileLayout>
  );
};

export default OrderHistoryPage;