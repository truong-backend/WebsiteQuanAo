// src/components/user/ui/PriceText.tsx
// Chịu trách nhiệm: Hiển thị giá tiền định dạng VND
import styles from './PriceText.module.scss';

interface PriceTextProps {
  amount:      number;
  color?:      string;
  fontWeight?: number | string;
  fontSize?:   number | string;
  className?:  string;
}

const PriceText: React.FC<PriceTextProps> = ({ amount, color, fontWeight, fontSize, className }) => (
  <span className={`${styles.price} ${className ?? ''}`} style={{ color, fontWeight, fontSize }}>
    {amount.toLocaleString('vi-VN')}₫
  </span>
);

export default PriceText;