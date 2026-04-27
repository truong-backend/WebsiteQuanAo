// Thay thế toàn bộ file:
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081'

export const ROUTES = {
  home:          '/',
  shop:          '/shop',
  product:       '/products/:slug',
  productPath:   (slug: string) => `/products/${slug}`,
  checkout:      '/checkout',
  orders:        '/orders',
  orderDetail:   '/orders/:id',
  orderPath:     (id: string) => `/orders/${id}`,
  profile:       '/profile',
  login:         '/login',
  register:      '/register',
  admin:         '/admin',
  oauth2Callback: '/oauth2/callback',
} as const