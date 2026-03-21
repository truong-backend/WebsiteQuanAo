// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from '@/modules';

// ── Auth ──────────────────────────────────────────────────────
import { LoginPage, RegisterPage } from '@/pages/auth';

// ── Admin ─────────────────────────────────────────────────────
import { AdminLayout } from '@/components/admin';
import {
  AccountPage,
  CategoryPage,
  ColorPage,
  ProductPage,
  ProductVariantPage,
  SizePage,
  OrderPage,
} from '@/pages/admin';

// ── User ──────────────────────────────────────────────────────
import {
  HomePage,
  ContactPage,
  CartPage,
  CheckoutPage,
  ProductListingPage,
  ProductDetailPage,
  OrderStatusPage,
  OrderInvoicePage,
  VnpayReturnPage,
  AboutPage,
  ProfilePage,
  ReturnPolicyPage,
  ShoppingGuidePage,
  OrderTrackingPage,
  OrderHistoryPage,
} from '@/pages/user';

// ── Route guards ──────────────────────────────────────────────

/** Redirect từ "/" dựa vào role */
const RoleBasedRedirect: React.FC = () => {
  if (authService.isAdmin()) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/products" replace />;
};

/** Yêu cầu đăng nhập */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Yêu cầu đăng nhập + role ADMIN */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (!authService.isAdmin())         return <Navigate to="/products" replace />;
  return <>{children}</>;
};

// ── AppRoutes ─────────────────────────────────────────────────

const AppRoutes: React.FC = () => (
  <Routes>

    {/* ── Auth ── */}
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* ── Public ── */}
    <Route path="/"          element={<RoleBasedRedirect />} />
    <Route path="/home"      element={<HomePage />} />
    <Route path="/about"     element={<AboutPage />} />
    <Route path="/contact"   element={<ContactPage />} />
    <Route path="/return-policy"    element={<ReturnPolicyPage />} />
    <Route path="/shopping-guide"   element={<ShoppingGuidePage />} />
    <Route path="/order-tracking"   element={<OrderTrackingPage />} />
    <Route path="/orders/history"   element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
    <Route path="/products"  element={<ProductListingPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />
    {/* <Route path="/payment/momo-return" element={<MomoReturnPage />} /> */}

    {/* ── Protected (user) ── */}
    <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
    <Route path="/orders/:id"         element={<ProtectedRoute><OrderStatusPage /></ProtectedRoute>} />
    <Route path="/orders/:id/invoice" element={<ProtectedRoute><OrderInvoicePage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

    {/* ── Admin (nested layout) ── */}
    <Route
      path="/admin"
      element={<AdminRoute><AdminLayout /></AdminRoute>}
    >
      <Route index                    element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard"         element={<div>Dashboard Page</div>} />
      <Route path="accounts"          element={<AccountPage />} />
      <Route path="categories"        element={<CategoryPage />} />
      <Route path="products"          element={<ProductPage />} />
      <Route path="product-variants"  element={<ProductVariantPage />} />
      <Route path="sizes"             element={<SizePage />} />
      <Route path="colors"            element={<ColorPage />} />
      <Route path="orders"            element={<OrderPage />} />
    </Route>

    {/* ── 404 ── */}
    <Route path="*" element={<div>404 - Page Not Found</div>} />

  </Routes>
);

export default AppRoutes;