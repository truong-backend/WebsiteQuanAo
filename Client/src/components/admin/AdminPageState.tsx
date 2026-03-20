// src/components/admin/AdminPageState.tsx
// Chịu trách nhiệm: Hiển thị trạng thái loading / error toàn trang admin
//   - loading → spinner + text
//   - error   → message + nút retry
//   - null    → không render gì
import styles from './AdminPageState.module.scss';

interface AdminPageStateProps {
  loading: boolean;
  error:   string | null;
  onRetry: () => void;
}

const AdminPageState: React.FC<AdminPageStateProps> = ({ loading, error, onRetry }) => {
  if (loading) return (
    <div className={styles.wrap}>
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.wrap}>
      <div className={styles.error}>
        <p className={styles.errorTitle}>Lỗi</p>
        <p className={styles.errorMsg}>{error}</p>
        <button className={styles.retryBtn} onClick={onRetry}>Thử lại</button>
      </div>
    </div>
  );

  return null;
};

export default AdminPageState;