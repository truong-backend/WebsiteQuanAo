// src/routes/AppRoutes.tsx — Final version, tất cả imports đã cập nhật
import { Routes, Route, Navigate } from "react-router-dom";

import { authService, LoginPage, RegisterPage } from "@/features/auth";
import AdminLayout from "@/layouts/admin/AdminLayout";
import {
  AccountPage,
  CategoryPage,
  ColorPage,
  ProductPage,
  ProductVariantPage,
  SizePage,
  OrderPage,
  ContactPage as AdminContactPage,
} from "@/features/admin";
import { ProductListingPage, ProductDetailPage } from "@/features/products";
import { CartPage, CheckoutPage } from "@/features/cart";
import {
  OrderStatusPage,
  OrderInvoicePage,
  VnpayReturnPage,
  OrderTrackingPage,
} from "@/features/orders";
import { ProfilePage, OrderHistoryPage } from "@/features/account";
import HomePage from "@/pages/user/HomePage";
import AboutPage from "@/pages/user/AboutPage";
import ContactPage from "@/pages/user/ContactPage";
import NotFoundPage from "@/pages/user/NotFoundPage";
import ReturnPolicyPage from "@/pages/user/ReturnPolicyPage";
import ShoppingGuidePage from "@/pages/user/ShoppingGuidePage";
import WishlistPage from "@/pages/user/WishlistPage";

const RoleBasedRedirect: React.FC = () => {
  if (authService.isAdmin()) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/products" replace />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (!authService.isAdmin()) return <Navigate to="/products" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/" element={<RoleBasedRedirect />} />
    <Route path="/home" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/return-policy" element={<ReturnPolicyPage />} />
    <Route path="/shopping-guide" element={<ShoppingGuidePage />} />
    <Route path="/order-tracking" element={<OrderTrackingPage />} />
    <Route path="/orders/history" element={<OrderHistoryPage />} />
    <Route path="/products" element={<ProductListingPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />

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
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/wishlist"
      element={
        <ProtectedRoute>
          <WishlistPage />
        </ProtectedRoute>
      }
    />

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
      <Route path="contacts" element={<AdminContactPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
