// src/pages/Cart/CartPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartService, type CartItem } from "../../../Service/CartService";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
import BackButton from "../../../Components/User/ui/BackButton/BackButton";
import EmptyState from "../../../Components/User/ui/EmptyState/EmptyState";
import PriceText from "../../../Components/User/ui/PriceText/PriceText";
import styles from "./CartPage.module.scss";

const BASE_URL = "http://localhost:8080";
const MIN_QUANTITY = 1;

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>(() => CartService.getCart());
  const navigate = useNavigate();

  const persist = (next: CartItem[]) => { setItems(next); CartService.setCart(next); };
  const handleChangeQty = (id: string, delta: number) =>
    persist(items.map((i) => i.id === id ? { ...i, quantity: Math.max(MIN_QUANTITY, i.quantity + delta) } : i));
  const handleRemove = (id: string) => persist(items.filter((i) => i.id !== id));

  const total      = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div className={styles.header__left}>
              <h1 className={styles.header__title}>Giỏ hàng</h1>
              {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </div>
            <BackButton />
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<span style={{ fontSize: 64 }}>🛍</span>}
              title="Giỏ hàng của bạn đang trống"
              description="Hãy chọn thêm sản phẩm để tiếp tục nhé!"
              actionLabel="Khám phá sản phẩm"
              actionTo="/products"
            />
          ) : (
            <div className={styles.layout}>

              {/* Item list */}
              <div className={styles.list}>
                {items.map((item, idx) => (
                  <div key={item.id}>
                    <div className={styles.item}>
                      <img
                        className={styles.img}
                        src={`${BASE_URL}${item.img}`}
                        alt={item.name}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/80"; }}
                      />
                      <div className={styles.info}>
                        <p className={styles.name}>{item.name}</p>
                        <PriceText amount={item.price} />
                      </div>
                      <div className={styles.qty}>
                        <button className={styles.qtyBtn} onClick={() => handleChangeQty(item.id, -1)}>−</button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button className={styles.qtyBtn} onClick={() => handleChangeQty(item.id, 1)}>+</button>
                      </div>
                      <button className={styles.removeBtn} onClick={() => handleRemove(item.id)} title="Xóa">✕</button>
                    </div>
                    {idx < items.length - 1 && <div className={styles.divider} />}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className={styles.summary}>
                <p className={styles.summary__title}>Tóm tắt đơn hàng</p>
                <div className={styles.summary__divider} />
                {items.map((item) => (
                  <div key={item.id} className={styles.summary__row}>
                    <span className={styles.summary__label}>{item.name} ×{item.quantity}</span>
                    <PriceText amount={item.price * item.quantity} />
                  </div>
                ))}
                <div className={styles.summary__divider} />
                <div className={styles.summary__total}>
                  <span className={styles.summary__totalLabel}>Tổng cộng</span>
                  <PriceText amount={total} variant="h6" fontSize={18} />
                </div>
                <button className={styles.btnCheckout} onClick={() => navigate("/checkout")}>
                  Tiến hành thanh toán
                </button>
                <button className={styles.btnBack} onClick={() => navigate(-1)}>
                  ← Tiếp tục mua sắm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CartPage;