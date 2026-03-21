// src/components/user/layout/ProfileLayout.tsx
// Chịu trách nhiệm: Layout trang tài khoản user
//   - Sidebar sticky bên trái: avatar, nav links
//   - Main content bên phải: flex:1
//   - Mobile: tab bar ngang thay thế sidebar
//   - Không dùng MUI — thuần className + SCSS module
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/modules';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './ProfileLayout.module.scss';

// ─── Icons (inline SVG, no extra dep) ────────────────────────

const IconUser = () => (
  <svg className={styles.navLink__icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBag = () => (
  <svg className={styles.navLink__icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconMap = () => (
  <svg className={styles.navLink__icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const IconHeart = () => (
  <svg className={styles.navLink__icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconLogout = () => (
  <svg className={styles.navLink__icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ─── Nav config ───────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Trang cá nhân', to: '/profile',  icon: <IconUser /> },
  { label: 'Đơn hàng',      to: '/orders',   icon: <IconBag /> },
  { label: 'Địa chỉ',       to: '/addresses', icon: <IconMap /> },
  { label: 'Yêu thích',     to: '/wishlist', icon: <IconHeart /> },
];

// ─── Props ────────────────────────────────────────────────────

interface ProfileLayoutProps {
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // const username = 'Tài khoản';
  // const initial  = username.charAt(0).toUpperCase();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar />

      {/* Mobile tab bar */}
      <nav className={styles.mobileNav} aria-label="Account navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={[
              styles.mobileNav__link,
              isActive(item.to) ? styles['mobileNav__link--active'] : '',
            ].join(' ')}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebar__header}>
            <p className={styles.sidebar__title}>My Account</p>
            <p className={styles.sidebar__sub}>Quản lý tài khoản</p>
          </div>

          <nav className={styles.sidebar__nav} aria-label="Account navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  styles.navLink,
                  isActive(item.to) ? styles['navLink--active'] : '',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div className={styles.sidebar__spacer} />
            <div className={styles.sidebar__divider} />

            <button
              className={`${styles.navLink} ${styles['navLink--danger']}`}
              onClick={handleLogout}
            >
              <IconLogout />
              Đăng xuất
            </button>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>
          <div className={styles.main__inner}>
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default ProfileLayout;