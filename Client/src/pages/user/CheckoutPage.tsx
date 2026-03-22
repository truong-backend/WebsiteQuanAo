// src/pages/user/CheckoutPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService, LocalCartService, PaymentGatewayService } from '@/modules';
import PageLayout from '@/components/user/layout/PageLayout';
import PriceText from '@/components/user/ui/PriceText';
import styles from './CheckoutPage.module.scss';

type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO';

const PAY_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'COD',   label: 'Thanh toán khi nhận hàng'},
  { value: 'VNPAY', label: 'VNPAY' },
  { value: 'MOMO',  label: 'MoMo' },
];

const CheckoutPage: React.FC = () => {
  const [items]                           = useState(() => LocalCartService.getCart());
  const [phoneNumber, setPhoneNumber]     = useState('');
  const [address, setAddress]             = useState('');
  const [note, setNote]                   = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const navigate = useNavigate();

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    try {
      setSubmitting(true);
      setError(null);

      const backendPaymentType = paymentMethod === 'COD' ? 'COD' : 'BANKING';

      const order = await OrderService.createOrderFromCart(items, {
        phoneNumber,
        address,
        note: note || undefined,
        paymentType: backendPaymentType,
      });

      if (paymentMethod === 'VNPAY') {
        const url = await PaymentGatewayService.createVnpayPayment(order.id, total);
        LocalCartService.clear();
        window.location.href = url;
        return;
      }
      if (paymentMethod === 'MOMO') {
        const url = await PaymentGatewayService.createMomoPayment(order.id, total);
        LocalCartService.clear();
        window.location.href = url;
        return;
      }

      LocalCartService.clear();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn hàng mới');
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.emptyMsg}>
            Giỏ hàng đang trống, hãy chọn sản phẩm trước.
          </p>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Header */}
          <h1 className={styles.title}>Thanh toán</h1>
          <p className={styles.subtitle}>Kiểm tra thông tin đơn hàng trước khi xác nhận</p>

          <div className={styles.layout}>

            {/* ── Form ── */}
            <form className={styles.formCard} onSubmit={handleSubmit}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.fieldset}>
                <label className={styles.label}>Số điện thoại *</label>
                <input
                  className={styles.input}
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0901 234 567"
                />
              </div>

              <div className={styles.fieldset}>
                <label className={styles.label}>Địa chỉ giao hàng *</label>
                <input
                  className={styles.input}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, quận, thành phố"
                />
              </div>

              <div className={styles.fieldset}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={`${styles.input} ${styles['input--textarea']}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
                />
              </div>

              <div className={styles.paySection}>
                <p className={styles.payTitle}>Phương thức thanh toán</p>
                <div className={styles.payOptions}>
                  {PAY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={[
                        styles.payOption,
                        paymentMethod === opt.value ? styles['payOption--active'] : '',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                      />
                      <span>{} {opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.submitRow}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </button>
              </div>
            </form>

            {/* ── Summary ── */}
            <div className={styles.summary}>
              <p className={styles.summary__title}>Tóm tắt đơn hàng</p>

              {items.map((item) => (
                <div key={item.id} className={styles.summary__row}>
                  <div className={styles.summary__nameBlock}>
                    <span className={styles.summary__name}>
                      {item.name} × {item.quantity}
                    </span>
                    {(item.colorName || item.sizeName) && (
                      <span className={styles.summary__variant}>
                        {[item.colorName, item.sizeName].filter(Boolean).join(' / ')}
                      </span>
                    )}
                  </div>
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