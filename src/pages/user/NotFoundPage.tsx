// src/pages/user/NotFoundPage.tsx
import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* Ghost 404 background */}
      <div className={styles.ghost}>
        <span>404</span>
      </div>

      {/* Content */}
      <div className={styles.card}>
        <p className={styles.label}>Lỗi 404 — Không tìm thấy trang</p>

        <h1 className={styles.number}>404</h1>

        <div className={styles.divider} />

        <h2 className={styles.heading}>Trang này không tồn tại</h2>

        <p className={styles.desc}>
          Đường dẫn bạn truy cập đã bị xóa, đổi tên hoặc chưa từng tồn tại.
          Hãy quay lại trang chủ hoặc tiếp tục mua sắm.
        </p>

        <div className={styles.actions}>
          <Link to="/home" className={styles.btnPrimary}>
            Về trang chủ
          </Link>
          <button className={styles.btnSecondary} onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>

    </div>
  );
};

export default NotFoundPage;