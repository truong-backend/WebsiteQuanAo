// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { authService } from "../Service/AuthService";

// ── Auth Pages ──────────────────────────────────────────────────────────────
import LoginPage from "../page/Auth/LoginPage";
import RegisterPage from "../page/Auth/RegisterPage";

// ── Admin ───────────────────────────────────────────────────────────────────
import AdminLayout from "../Components/Admin/layouts/AdminLayout";
import AccountPage from "../page/Admin/Accout/AccountPage";
import CategoryPage from "../page/Admin/Category/CategoryPage";
import ColorPage from "../page/Admin/Color/ColorPage";
import ProductPage from "../page/Admin/Product/ProductPage";
import ProductVariantPage from "../page/Admin/ProductVariant/ProductVariantPage";
import SizePage from "../page/Admin/Size/SizePage";
import OrderPage from "../page/Admin/Order/OrderPage";

// ── User Pages ───────────────────────────────────────────────────────────────
import HomePage from "../page/User/Home/HomePage";
import ProductListPage from "../page/User/Product/ProductListingPage";
import ProductDetailPage from "../page/User/ProductDetail/ProductDetailPage";
import CartPage from "../page/User/Cart/CartPage";
import CheckoutPage from "../page/User/Checkout/CheckoutPage";
import OrderStatusPage from "../page/User/OrderStatus/OrderStatusPage";
import OrderInvoicePage from "../page/User/OrderInvoice/OrderInvoicePage";
import VnpayReturnPage from "../page/User/VnPay/VnpayReturnPage";
// import AccountProfilePage from "../page/User/AccountProfilePage/AccountProfilePage";
import ContactPage from "../page/User/ContactPage/ContactPage";
import AboutPage from "../page/User/About/AboutPage";
// import MomoReturnPage from "../page/Order/MomoReturnPage";

// ── Guards ───────────────────────────────────────────────────────────────────
const RoleBasedRedirect = () => {
  if (authService.isAdmin()) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/products" replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (!authService.isAdmin()) return <Navigate to="/products" replace />;
  return <>{children}</>;
};

// ── AppRoutes ─────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => (
  <Routes>
    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Public */}
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductListPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    {/* <Route path="/payment/momo-return" element={<MomoReturnPage />} /> */}

    {/* Protected – user */}
    <Route
      path="/cart"
      element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders/:id"
      element={
        <ProtectedRoute>
          <OrderStatusPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders/:id/invoice"
      element={
        <ProtectedRoute>
          <OrderInvoicePage />
        </ProtectedRoute>
      }
    />
    {/* <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <AccountProfilePage />
        </ProtectedRoute>
      }
    /> */}

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }
    >
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

    {/* Root & 404 */}
    <Route path="/" element={<RoleBasedRedirect />} />
    <Route path="*" element={<div>404 - Page Not Found</div>} />
  </Routes>
);

export default AppRoutes;
