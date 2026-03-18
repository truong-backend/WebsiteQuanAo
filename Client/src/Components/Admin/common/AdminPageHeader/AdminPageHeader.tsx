// src/Components/Admin/common/AdminPageHeader/AdminPageHeader.tsx
import styles from './AdminPageHeader.module.scss';

interface AdminPageHeaderProps {
  title:         string;
  createLabel?:  string;
  onCreateClick: () => void;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title, createLabel = 'Tạo mới', onCreateClick,
}) => (
  <div className={styles.header}>
    <h2 className={styles.title}>{title}</h2>
    <button className={styles.createBtn} onClick={onCreateClick}>
      + {createLabel}
    </button>
  </div>
);

export default AdminPageHeader;