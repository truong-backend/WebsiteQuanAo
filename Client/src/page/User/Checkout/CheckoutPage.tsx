// src/pages/Cart/CheckoutPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderService } from "../../../Service/OrderService";
import { CartService } from "../../../Service/CartService";
import { PaymentGatewayService } from "../../../Service/PaymentGatewayService";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
import AppButton from "../../../Components/User/Button/AppButton";
import PriceText from "../../../Components/User/ui/PriceText/PriceText";
import styles from "./CheckoutPage.module.scss";

type PaymentMethod = "COD" | "VNPAY" | "MOMO";

const PAY_OPTIONS: { value: PaymentMethod; label: string; emoji: string }[] = [
  { value: "COD",   label: "Thanh toán khi nhận hàng", emoji: "💵" },
  { value: "VNPAY", label: "VNPAY",                    emoji: "🏦" },
  { value: "MOMO",  label: "MoMo",                     emoji: "💜" },
];

const CheckoutPage: React.FC = () => {
  const [items]         = useState(() => CartService.getCart());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress]         = useState("");
  const [note, setNote]               = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const navigate = useNavigate();

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    try {
      setSubmitting(true); setError(null);
      const order = await OrderService.createOrderFromCart(items, { phoneNumber, address, note: note || undefined });
      if (paymentMethod === "VNPAY") {
        const url = await PaymentGatewayService.createVnpayPayment(order.id, total);
        CartService.clear(); window.location.href = url; return;
      }
      if (paymentMethod === "MOMO") {
        const url = await PaymentGatewayService.createMomoPayment(order.id, total);
        CartService.clear(); window.location.href = url; return;
      }
      CartService.clear(); navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng mới");
    } finally { setSubmitting(false); }
  };

  if (!items.length) return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Giỏ hàng đang trống, hãy chọn sản phẩm trước.</p>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Thanh toán</h1>
          <div className={styles.layout}>

            {/* Form */}
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.fieldset}>
                <label className={styles.label}>Số điện thoại *</label>
                <input className={styles.input} type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0901 234 567" />
              </div>
              <div className={styles.fieldset}>
                <label className={styles.label}>Địa chỉ giao hàng *</label>
                <input className={styles.input} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, quận, thành phố" />
              </div>
              <div className={styles.fieldset}>
                <label className={styles.label}>Ghi chú</label>
                <textarea className={`${styles.input} ${styles["input--textarea"]}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yêu cầu đặc biệt, thời gian giao hàng..." />
              </div>

              <div className={styles.paySection}>
                <p className={styles.payTitle}>Phương thức thanh toán</p>
                <div className={styles.payOptions}>
                  {PAY_OPTIONS.map((opt) => (
                    <label key={opt.value} className={`${styles.payOption} ${paymentMethod === opt.value ? styles["payOption--active"] : ""}`}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                      <span>{opt.emoji} {opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.submitRow}>
                <AppButton type="submit" variant="contained" loading={submitting}>
                  Xác nhận đặt hàng
                </AppButton>
              </div>
            </form>

            {/* Summary */}
            <div className={styles.summary}>
              <p className={styles.summary__title}>Tóm tắt đơn hàng</p>
              {items.map((item) => (
                <div key={item.id} className={styles.summary__row}>
                  <span className={styles.summary__name}>{item.name} × {item.quantity}</span>
                  <PriceText amount={item.price * item.quantity} />
                </div>
              ))}
              <div className={styles.summary__divider} />
              <div className={styles.summary__total}>
                <span className={styles.summary__totalLbl}>Tổng cộng</span>
                <PriceText amount={total} fontWeight="bold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;