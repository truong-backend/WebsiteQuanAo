// src/features/orders/components/OrderTrackingPage.tsx
// Moved from: src/pages/user/OrderTrackingPage.tsx
// No module/type imports changed — file was already self-contained
import React, { useState } from "react";
import styles from "./OrderTrackingPage.module.scss";
import PageLayout from "@/layouts/user/PageLayout";

type StepStatus = "done" | "active" | "pending";

interface Step {
  label: string;
  icon: string;
  status: StepStatus;
}
interface OrderItem {
  series: string;
  name: string;
  variant: string;
  price: string;
  qty: number;
  img: string;
  imgAlt: string;
}

const STEPS: Step[] = [
  { label: "Đã tiếp nhận", icon: "check", status: "done" },
  { label: "Đang xử lý", icon: "check", status: "done" },
  { label: "Đang vận chuyển", icon: "local_shipping", status: "active" },
  { label: "Đã giao hàng", icon: "inventory_2", status: "pending" },
];

const ORDER_ITEMS: OrderItem[] = [
  {
    series: "Essential Series",
    name: "Noir Essential T-Shirt",
    variant: "Size: Large | Màu: Obsidian",
    price: "1.250.000₫",
    qty: 1,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqBk4sQYWuvb2Js3xkBGyQLW9syX_ZVIwqCqGGujx7Tw-iyyid_iCpKKN6alYrRyJS8Nx3cp33BVQtZjBsWAv1zjIh9FQPolD8TMsRc47GvQ2QJJyF_GXUmGfcDU3C53KcTG9V101uxDIaJqJQwB3GueYv9Q1v0kSiJYCTwTD-VhfqhOq3eROVWQe-9yAoLMD61TuW0oSyw5u9tcam8F_Yjh14vrkVl_bvCPJyNHpGQ7YkL559cPJLr6NyNW2_CE4DD9J2gqsLVhk",
    imgAlt: "Minimalist black cotton t-shirt flat lay",
  },
  {
    series: "Winter Collection",
    name: "Cashmere Scarf",
    variant: "Màu: Heather Gray",
    price: "2.800.000₫",
    qty: 1,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB67vqLquX4tYB6hYatwLqq2ZZK5lboK7_U4zyAL4mJ7BvOk-xgYZNqIewNNalcHhcSOkPCpfbfxxYZhu09fidLCOmoew6TnO-Nl5XXHkzEfiU9KZmNCfJ1FbSWUHS5ANDsczzTI7C17_Hgw8wo0ePKH2pkOIre0BoZgzgoJb9Ew1EBDDoQQGVIUwVVhQUP-h0Lvm2r5uvd_OLOuPD9gjRmv7e__uzJUUUoLevFIzqqywQSXGkqUkexQDAN6lzxq9qyc6Ce9RubFOA",
    imgAlt: "High quality gray cashmere scarf folded",
  },
];

const OrderTrackingPage: React.FC = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with order tracking API
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Tra cứu Đơn hàng</h1>
          <p>
            Theo dõi hành trình tuyệt tác của bạn từ xưởng chế tác đến tận tay.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Search Form */}
          <section className={styles.formCard}>
            <h2>Thông tin tra cứu</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <label htmlFor="orderId">Mã đơn hàng</label>
                <input
                  id="orderId"
                  type="text"
                  placeholder="VD: AM-982341"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="email">Email đặt hàng</label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.submitBtn}>
                Tra cứu ngay
              </button>
            </form>
            <div className={styles.formSupport}>
              <p>Cần hỗ trợ?</p>
              <div className={styles.supportLinks}>
                <a href="/contact" className={styles.supportLink}>
                  <span
                    className={`material-symbols-outlined ${styles.supportIcon}`}
                  >
                    support_agent
                  </span>
                  <span>Liên hệ bộ phận Chăm sóc</span>
                </a>
                <a href="/shopping-guide" className={styles.supportLink}>
                  <span
                    className={`material-symbols-outlined ${styles.supportIcon}`}
                  >
                    help_outline
                  </span>
                  <span>Câu hỏi thường gặp (FAQ)</span>
                </a>
              </div>
            </div>
          </section>

          {/* Result */}
          <section className={styles.resultColumn}>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <div>
                  <span className={styles.statusBadge}>Đang vận chuyển</span>
                  <h3 className={styles.statusTitle}>Đơn hàng #AM-982341</h3>
                </div>
                <div className={styles.estimatedDelivery}>
                  <p className={styles.deliveryLabel}>Dự kiến giao hàng</p>
                  <p className={styles.deliveryDate}>14.10.2024</p>
                </div>
              </div>

              <div className={styles.stepper}>
                <div className={styles.stepperTrackBg} />
                <div className={styles.stepperTrackFill} />
                <div className={styles.stepperItems}>
                  {STEPS.map((step) => (
                    <div key={step.label} className={styles.stepperItem}>
                      <div
                        className={`${styles.stepDot} ${styles[step.status]}`}
                      >
                        <span
                          className={`material-symbols-outlined ${styles.dotIcon}`}
                        >
                          {step.icon}
                        </span>
                      </div>
                      <span
                        className={`${styles.stepLabel} ${step.status === "active" ? styles.activeLabel : ""}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.shipmentMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Đơn vị vận chuyển</span>
                  <span className={styles.metaValue}>
                    Standard Express International
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Mã vận đơn</span>
                  <span className={styles.metaValue}>
                    SE-AM-559021
                    <span
                      className={`material-symbols-outlined ${styles.copyIcon}`}
                    >
                      content_copy
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.itemsCard}>
              <h4>Sản phẩm trong kiện hàng</h4>
              <div className={styles.itemsList}>
                {ORDER_ITEMS.map((item) => (
                  <div key={item.name} className={styles.orderItem}>
                    <div className={styles.itemThumb}>
                      <img src={item.img} alt={item.imgAlt} />
                    </div>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemSeries}>{item.series}</p>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemVariant}>{item.variant}</p>
                    </div>
                    <div className={styles.itemPrice}>
                      <p className={styles.price}>{item.price}</p>
                      <p className={styles.qty}>x {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.itemsTotal}>
                <span className={styles.totalLabel}>Tổng thanh toán</span>
                <span className={styles.totalAmount}>4.050.000₫</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderTrackingPage;