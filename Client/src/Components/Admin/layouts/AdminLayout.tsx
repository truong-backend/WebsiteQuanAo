// src/layouts/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../Service/AuthService';
import {
  UserOutlined, AppstoreOutlined, ShoppingOutlined,
  BgColorsOutlined, ColumnHeightOutlined, ShoppingCartOutlined,
  LogoutOutlined, DashboardOutlined, MenuOutlined, CloseOutlined,
} from '@ant-design/icons';
import styles from './AdminLayout.module.scss';

const navItems = [
  { to: '/admin/dashboard',        icon: <DashboardOutlined />,     label: 'Dashboard' },
  { to: '/admin/accounts',         icon: <UserOutlined />,          label: 'Tài khoản' },
  { to: '/admin/categories',       icon: <AppstoreOutlined />,      label: 'Danh mục' },
  { to: '/admin/products',         icon: <ShoppingOutlined />,      label: 'Sản phẩm' },
  { to: '/admin/product-variants', icon: <ShoppingOutlined />,      label: 'Biến thể SP' },
  { to: '/admin/sizes',            icon: <ColumnHeightOutlined />,  label: 'Kích thước' },
  { to: '/admin/colors',           icon: <BgColorsOutlined />,      label: 'Màu sắc' },
  { to: '/admin/orders',           icon: <ShoppingCartOutlined />,  label: 'Đơn hàng' },
];

const AdminLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

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

      {/* Mobile overlay */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={[styles.sidebar, open ? styles['sidebar--open'] : ''].join(' ')}>

        <div className={styles.sidebarHead}>
          <span className={styles.sidebarLogo}>
            Admin<span>Panel</span>
          </span>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Đóng menu">
            <CloseOutlined />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={[styles.navItem, isActive(to) ? styles['navItem--active'] : ''].join(' ')}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          <div className={styles.navDivider} />

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* Main */}
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

export default AdminLayout;