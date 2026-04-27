import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from 'react-router-dom'
import { Spinner } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { useAuthStore } from '@features/auth/model/authStore'
import { Navbar } from '@widgets/navbar'
import { Footer } from '@widgets/footer'
import { CartDrawer } from '@widgets/cart-drawer'

const HomePage           = lazy(() => import('@pages/home/HomePage'))
const ShopPage           = lazy(() => import('@pages/shop/ShopPage'))
const ProductPage        = lazy(() => import('@pages/product/ProductPage'))
const CheckoutPage       = lazy(() => import('@pages/checkout/CheckoutPage'))
const ProfilePage        = lazy(() => import('@pages/profile/ProfilePage'))
const AdminPage          = lazy(() => import('@pages/admin/AdminPage'))
const OrdersPage         = lazy(() => import('@pages/orders/OrdersPage').then(m => ({ default: m.OrdersPage })))
const OrderDetailPage    = lazy(() => import('@pages/orders/OrdersPage').then(m => ({ default: m.OrderDetailPage })))
const LoginPage          = lazy(() => import('@pages/auth/AuthPages').then(m => ({ default: m.LoginPage })))
const RegisterPage       = lazy(() => import('@pages/auth/AuthPages').then(m => ({ default: m.RegisterPage })))
const VerifyEmailPage    = lazy(() => import('@pages/auth/AuthPages').then(m => ({ default: m.VerifyEmailPage })))
const ForgotPasswordPage = lazy(() => import('@pages/auth/AuthPages').then(m => ({ default: m.ForgotPasswordPage })))
const VNPayReturnPage    = lazy(() => import('@pages/payment/VNPayReturnPage'))
const OAuth2CallbackPage = lazy(() => import('@pages/auth/OAuth2CallbackPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  )
}

function RootLayout() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuth)
  if (!isAuth) return <Navigate to={ROUTES.login} replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.home,              element: <HomePage /> },
      { path: ROUTES.shop,              element: <ShopPage /> },
      { path: ROUTES.product,           element: <ProductPage /> },
      { path: ROUTES.login,             element: <LoginPage /> },
      { path: ROUTES.register,          element: <RegisterPage /> },
      { path: '/verify-email',          element: <VerifyEmailPage /> },
      { path: '/forgot-password',       element: <ForgotPasswordPage /> },
      { path: '/payment/vnpay-return',  element: <VNPayReturnPage /> },
      // OAuth2 Google callback
      { path: ROUTES.oauth2Callback,    element: <OAuth2CallbackPage /> },
      { path: ROUTES.checkout,          element: <RequireAuth><CheckoutPage /></RequireAuth> },
      { path: ROUTES.orders,            element: <RequireAuth><OrdersPage /></RequireAuth> },
      { path: ROUTES.orderDetail,       element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: ROUTES.profile,           element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: ROUTES.admin,             element: <RequireAuth><AdminPage /></RequireAuth> },
      {
        path: '*',
        element: (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-6">
            <p className="font-display text-8xl text-brand-light font-light">404</p>
            <p className="font-display text-3xl">Trang không tìm thấy</p>
            <a href={ROUTES.home} className="text-xs uppercase tracking-widest border border-brand-black px-6 py-3 hover:bg-brand-black hover:text-brand-white transition-colors">
              Về trang chủ
            </a>
          </div>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}