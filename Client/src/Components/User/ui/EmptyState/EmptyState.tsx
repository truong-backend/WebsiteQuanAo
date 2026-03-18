// src/Components/User/ui/EmptyState/EmptyState.tsx
import { Link } from "react-router-dom";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon?:         React.ReactNode;
  title:         string;
  description?:  string;
  actionLabel?:  string;
  actionTo?:     string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, actionTo }) => (
  <div className={styles.wrap}>
    {icon && <div className={styles.icon}>{icon}</div>}
    <p className={styles.title}>{title}</p>
    {description && <p className={styles.desc}>{description}</p>}
    {actionLabel && actionTo && <Link className={styles.btn} to={actionTo}>{actionLabel}</Link>}
  </div>
);
export default EmptyState;