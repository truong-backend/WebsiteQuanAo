// src/layouts/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../Service/AuthService';
import {
  UserOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  BgColorsOutlined,
  ColumnHeightOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const navItems = [
  { to: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { to: '/admin/accounts', icon: <UserOutlined />, label: 'Tài khoản' },
  { to: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
  { to: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
  { to: '/admin/product-variants', icon: <ShoppingOutlined />, label: 'Biến thể SP' },
  { to: '/admin/sizes', icon: <ColumnHeightOutlined />, label: 'Kích thước' },
  { to: '/admin/colors', icon: <BgColorsOutlined />, label: 'Màu sắc' },
  { to: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      authService.logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-30
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:shrink-0
        `}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-700 transition"
            aria-label="Đóng menu"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map(({ to, icon, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded transition
                    ${isActive(to)
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-gray-700 text-gray-200'
                    }
                  `}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              </li>
            ))}

            {/* Logout */}
            <li className="pt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-red-600 transition w-full text-left text-gray-200"
              >
                <LogoutOutlined />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow p-4 flex items-center gap-4 sticky top-0 z-10">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded hover:bg-gray-100 transition text-gray-700"
            aria-label="Mở menu"
          >
            <MenuOutlined className="text-xl" />
          </button>

          <h2 className="text-xl font-semibold text-gray-800">
            Hệ thống quản trị
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-100 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;