// src/features/orders/components/VnpayReturnPage.tsx
// Moved from: src/pages/user/VnpayReturnPage.tsx
// No module/type imports changed — file was already self-contained
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './VnpayReturnPage.module.scss';

const formatAmount = (val: string | null) => {
  if (!val) return '';
  const n = parseInt(val, 10);
  return isNaN(n) ? val : new Intl.NumberFormat('vi-VN').format(n / 100) + ' VND';
};

const VnpayReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params   = new URLSearchParams(location.search);

  const status        = params.get('status');
  const responseCode  = params.get('vnp_ResponseCode');
  const orderId       = params.get('orderId') ?? params.get('vnp_TxnRef');
  const transactionNo = params.get('transactionNo');
  const bankCode      = params.get('bankCode');
  const amount        = params.get('amount');
  const message       = params.get('message');
  const isSuccess     = status === 'success' || responseCode === '00';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>{isSuccess ? '✅' : '❌'}</div>
        <h1 className={`${styles.status} ${isSuccess ? styles['status--success'] : styles['status--fail']}`}>
          {message ?? (isSuccess ? 'Thanh toán VNPAY thành công' : 'Thanh toán thất bại hoặc bị hủy')}
        </h1>
        {orderId       && <p className={styles.meta}>Mã đơn hàng: <strong>#{orderId}</strong></p>}
        {transactionNo && <p className={styles.meta}>Mã giao dịch: <strong>{transactionNo}</strong></p>}
        {bankCode      && <p className={styles.meta}>Ngân hàng: <strong>{bankCode}</strong></p>}
        {amount        && <p className={styles.meta}>Số tiền: <strong>{formatAmount(amount)}</strong></p>}
        {(orderId || transactionNo) && <div className={styles.divider} />}
        <button className={styles.btn}
          onClick={() => orderId ? navigate(`/orders/${orderId}`) : navigate('/products')}>
          {orderId ? 'Xem trạng thái đơn hàng' : 'Tiếp tục mua sắm'}
        </button>
      </div>
    </div>
  );
};

export default VnpayReturnPage;
