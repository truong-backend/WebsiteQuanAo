// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './page/Admin/Auth/LoginPage';
import RegisterPage from './page/Admin/Auth/RegisterPage';
import AdminLayout from './Components/Admin/layouts/AdminLayout';
import AccountPage from './page/Admin/Accout/AccountPage';
import CategoryPage from './page/Admin/Category/CategoryPage';
import ColorPage from './page/Admin/Color/ColorPage';
import ProductPage from './page/Admin/Product/ProductPage';
import ProductVariantPage from './page/Admin/ProductVariant/ProductVariantPage';
import SizePage from './page/Admin/Size/SizePage';
import OrderPage from './page/Admin/Order/OrderPage';
import { authService } from './Service/AuthService';
import ProductListingPage from './page/User/ProductListingPage';
import ProductDetailPage from './page/User/ProductDetailPage';
import CartPage from './page/User/CartPage';
import CheckoutPage from './page/User/CheckoutPage';
import OrderStatusPage from './page/User/OrderStatusPage';
import OrderInvoicePage from './page/User/OrderInvoicePage';
import VnpayReturnPage from './page/User/VnpayReturnPage';
import MomoReturnPage from './page/User/MomoReturnPage';

// ─── Redirect theo role (dùng cho route "/") ─────────────────────────────────
const RoleBasedRedirect = () => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (authService.isAdmin()) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/products" replace />;
};

// ─── Chỉ check đã đăng nhập ───────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Chỉ cho phép ROLE_ADMIN ──────────────────────────────────────────────────
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (!authService.isAdmin()) return <Navigate to="/products" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* ─── Auth (luôn truy cập được) ──────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ─── Public Routes ──────────────────────────────────────────────────── */}
      <Route path="/products" element={<ProductListingPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />
      <Route path="/payment/momo-return" element={<MomoReturnPage />} />

      {/* ─── User Routes (cần đăng nhập) ────────────────────────────────────── */}
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderStatusPage /></ProtectedRoute>} />
      <Route path="/orders/:id/invoice" element={<ProtectedRoute><OrderInvoicePage /></ProtectedRoute>} />

      {/* ─── Admin Routes (chỉ ROLE_ADMIN) ──────────────────────────────────── */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<div>Dashboard Page</div>} />
        <Route path="accounts" element={<AccountPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="product-variants" element={<ProductVariantPage />} />
        <Route path="sizes" element={<SizePage />} />
        <Route path="colors" element={<ColorPage />} />
        <Route path="orders" element={<OrderPage />} />
      </Route>

      {/* ─── Root redirect theo role ─────────────────────────────────────────── */}
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;