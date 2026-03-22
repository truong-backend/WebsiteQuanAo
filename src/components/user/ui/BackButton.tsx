// src/components/user/ui/BackButton.tsx
// Chịu trách nhiệm: Nút quay lại — navigate(-1) hoặc navigate(to)
import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.scss';

interface BackButtonProps {
  label?: string;
  to?:    string;
}

const BackButton: React.FC<BackButtonProps> = ({ label = 'Tiếp tục mua sắm', to }) => {
  const navigate = useNavigate();
  return (
    <button className={styles.btn} onClick={() => (to ? navigate(to) : navigate(-1))}>
      <span className={`material-symbols-outlined ${styles.arrow}`}>arrow_back</span>
      {label}
    </button>
  );
};

export default BackButton;