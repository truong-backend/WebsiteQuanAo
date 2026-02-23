// src/layouts/AdminLayout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../Service/AuthService';
import { 
  UserOutlined, 
  AppstoreOutlined, 
  ShoppingOutlined, 
  BgColorsOutlined,
  ColumnHeightOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      authService.logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <DashboardOutlined />
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/accounts" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <UserOutlined />
                <span>Tài khoản</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/categories" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <AppstoreOutlined />
                <span>Danh mục</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/products" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <ShoppingOutlined />
                <span>Sản phẩm</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/product-variants" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <ShoppingOutlined />
                <span>Biến thể SP</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/sizes" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <ColumnHeightOutlined />
                <span>Kích thước</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/colors" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <BgColorsOutlined />
                <span>Màu sắc</span>
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/orders" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                <ShoppingCartOutlined />
                <span>Đơn hàng</span>
              </Link>
            </li>
            
            <li className="pt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-red-600 transition w-full text-left"
              >
                <LogoutOutlined />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100">
        <header className="bg-white shadow p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Hệ thống quản trị
          </h2>
        </header>
        
        <div className="p-6">
          <Outlet /> {/* Render child routes here */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;