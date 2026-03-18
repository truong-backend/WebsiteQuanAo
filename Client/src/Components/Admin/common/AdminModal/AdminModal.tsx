// src/Components/Admin/common/AdminModal/AdminModal.tsx
import styles from './AdminModal.module.scss';

interface AdminModalProps {
  open:     boolean;
  title:    string;
  onClose:  () => void;
  children: React.ReactNode;
  size?:    'sm' | 'md' | 'lg';
}

const AdminModal: React.FC<AdminModalProps> = ({
  open, title, onClose, children, size = 'md',
}) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={[styles.dialog, styles[`dialog--${size}`]].join(' ')}>
        <div className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminModal;