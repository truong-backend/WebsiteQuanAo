// src/components/user/ui/ErrorAlert.tsx
// Chịu trách nhiệm: Banner lỗi inline với nút retry tùy chọn
import styles from './ErrorAlert.module.scss';

interface ErrorAlertProps { message: string; onRetry?: () => void; retryLabel?: string; }

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry, retryLabel = 'Thử lại' }) => (
  <div className={styles.wrap}>
    <span className={styles.icon}>⚠</span>
    <span className={styles.msg}>{message}</span>
    {onRetry && <button className={styles.retry} onClick={onRetry}>{retryLabel}</button>}
  </div>
);

export default ErrorAlert;  