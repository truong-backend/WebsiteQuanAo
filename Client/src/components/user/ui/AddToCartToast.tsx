// src/components/user/ui/AddToCartToast.tsx
// Chịu trách nhiệm: Toast thông báo thêm vào giỏ hàng
//   - Tự ẩn sau 3 giây + animation fade-out
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddToCartToast.module.scss';

interface AddToCartToastProps {
  open:        boolean;
  productName: string | null;
  onClose:     () => void;
}

const AddToCartToast: React.FC<AddToCartToastProps> = ({ open, productName, onClose }) => {
  const navigate = useNavigate();
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => { setHiding(true); setTimeout(onClose, 250); }, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={[styles.toast, hiding ? styles['toast--hide'] : ''].join(' ')}>
      <span className={styles.icon}>✓</span>
      <span className={styles.name}><strong>{productName}</strong> đã thêm vào giỏ!</span>
      <button className={styles.btn} onClick={() => { onClose(); navigate('/cart'); }}>Xem giỏ</button>
    </div>
  );
};

export default AddToCartToast;