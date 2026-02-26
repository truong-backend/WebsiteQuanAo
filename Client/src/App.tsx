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

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Public Routes - Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/products" element={<ProductListingPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders/:id" element={<OrderStatusPage />} />
      <Route path="/orders/:id/invoice" element={<OrderInvoicePage />} />
      <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />
      <Route path="/payment/momo-return" element={<MomoReturnPage />} />
      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<div>Dashboard Page</div>} />
        
        {/* Account Management */}
        <Route path="accounts" element={<AccountPage />} />
        
        {/* Category Management */}
        <Route path="categories" element={<CategoryPage />} />
        
        {/* Product Management */}
        <Route path="products" element={<ProductPage />} />
        <Route path="product-variants" element={<ProductVariantPage />} />
        
        {/* Attributes Management */}
        <Route path="sizes" element={<SizePage />} />
        <Route path="colors" element={<ColorPage />} />
        
        {/* Order Management */}
        <Route path="orders" element={<OrderPage />} />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 Not Found */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;