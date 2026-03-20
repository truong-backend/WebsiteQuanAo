// src/components/admin/AdminLayout.tsx
// Chịu trách nhiệm: Shell layout cho toàn bộ trang admin
//   - Sidebar với nav items + logout
//   - Mobile hamburger + overlay
//   - Outlet cho nested routes
//
// Pattern: AdminLayoutInner nhận key={location.pathname} từ AdminLayout (outer).
// Khi route thay đổi → React remount AdminLayoutInner → state `open` reset về false
// mà không cần useEffect + setState (tránh lỗi react-hooks/set-state-in-effect).
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/modules';
import {
  UserOutlined, AppstoreOutlined, ShoppingOutlined,
  BgColorsOutlined, ColumnHeightOutlined, ShoppingCartOutlined,
  LogoutOutlined, DashboardOutlined, MenuOutlined, CloseOutlined,
} from '@ant-design/icons';
import styles from './AdminLayout.module.scss';

const NAV_ITEMS = [
  { to: '/admin/dashboard',        icon: <DashboardOutlined />,     label: 'Dashboard' },
  { to: '/admin/accounts',         icon: <UserOutlined />,          label: 'Tài khoản' },
  { to: '/admin/categories',       icon: <AppstoreOutlined />,      label: 'Danh mục' },
  { to: '/admin/products',         icon: <ShoppingOutlined />,      label: 'Sản phẩm' },
  { to: '/admin/product-variants', icon: <ShoppingOutlined />,      label: 'Biến thể SP' },
  { to: '/admin/sizes',            icon: <ColumnHeightOutlined />,  label: 'Kích thước' },
  { to: '/admin/colors',           icon: <BgColorsOutlined />,      label: 'Màu sắc' },
  { to: '/admin/orders',           icon: <ShoppingCartOutlined />,  label: 'Đơn hàng' },
];

// ─── Inner (remounts on every route change → open resets automatically) ───────
const AdminLayoutInner: React.FC = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [open, setOpen] = useState(false);

  // Close on Escape — subscribe event trong callback, không gọi setState trực tiếp
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      authService.logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.shell}>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={[styles.sidebar, open ? styles['sidebar--open'] : ''].join(' ')}>
        <div className={styles.sidebarHead}>
          <span className={styles.sidebarLogo}>Admin<span>Panel</span></span>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Đóng menu">
            <CloseOutlined />
          </button>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <Link
              key={to} to={to}
              className={[styles.navItem, isActive(to) ? styles['navItem--active'] : ''].join(' ')}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
          <div className={styles.navDivider} />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogoutOutlined /><span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <button className={styles.hamburger} onClick={() => setOpen(true)} aria-label="Mở menu">
            <MenuOutlined />
          </button>
          <span className={styles.headerTitle}>Hệ thống quản trị</span>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ─── Outer (truyền key để trigger remount khi đổi route) ──────────────────────
const AdminLayout: React.FC = () => {
  const location = useLocation();
  return <AdminLayoutInner key={location.pathname} />;
};

export default AdminLayout;