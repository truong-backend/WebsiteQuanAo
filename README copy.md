# LUXE Fashion Store — Frontend

React 19 + Vite + TypeScript theo kiến trúc **Feature-Sliced Design (FSD)**.

## Yêu cầu

- Node.js ≥ 18
- Backend Spring Boot đang chạy tại `http://localhost:8080`

## Cài đặt & chạy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build production
```

## Cấu trúc dự án (FSD)

```
src/
├── app/                   ← Khởi động: router, providers, global CSS
│   ├── router/            ← React Router v7 với lazy loading
│   ├── providers/         ← QueryClientProvider
│   └── styles/            ← Tailwind global CSS
│
├── pages/                 ← Mỗi route = 1 page (chỉ compose widgets)
│   ├── home/HomePage.tsx
│   ├── shop/ShopPage.tsx
│   ├── product/ProductPage.tsx
│   ├── checkout/CheckoutPage.tsx
│   ├── orders/OrdersPage.tsx   (+ OrderDetailPage)
│   ├── profile/ProfilePage.tsx
│   ├── admin/AdminPage.tsx
│   └── auth/AuthPages.tsx      (LoginPage + RegisterPage)
│
├── widgets/               ← UI blocks lớn, reusable
│   ├── navbar/            ← Sticky navbar + user menu + cart badge
│   ├── footer/
│   ├── cart-drawer/       ← Slide-in cart sidebar
│   ├── product-card/      ← Card với hover image + quick add
│   ├── filter-bar/        ← Search + category + price + color + size
│   └── review-list/       ← Hiển thị review + form viết review
│
├── features/              ← Nghiệp vụ có state (UI + model + api)
│   ├── auth/              ← LoginForm, RegisterForm, authStore (Zustand)
│   ├── cart/              ← cartStore (Zustand) + cartApi
│   ├── catalog/           ← filterStore (Zustand) + catalogApi
│   ├── orders/            ← ordersApi
│   ├── reviews/           ← reviewsApi
│   └── admin/             ← adminApi (CRUD sản phẩm, danh mục)
│
├── entities/              ← Domain model thuần tuý (types + helpers)
│   ├── user/              ← UserInfo, isAdmin()
│   ├── product/           ← ProductListDto, getEffectivePrice(), StarRating, ColorSwatch...
│   ├── order/             ← OrderDto, ORDER_STATUS_LABEL, canCancelOrder()
│   └── category/          ← Category, flattenCategories()
│
└── shared/                ← Không biết về domain, dùng được ở mọi layer
    ├── api/client.ts      ← axios + JWT interceptor + 401 handler
    ├── config/            ← API_BASE, ROUTES
    ├── lib/               ← cn(), formatPrice(), formatDate(), toast()
    ├── types/             ← Toàn bộ TypeScript types (khớp 100% Java DTOs)
    └── ui/                ← Button, Input, Select, Spinner, Badge, Skeleton, Modal, EmptyState
```

## Quy tắc import

```
app → pages → widgets → features → entities → shared
```

- Layer trên **có thể** import layer dưới
- Layer dưới **không được** import layer trên
- Các feature/entity ngang hàng **không được** import lẫn nhau trực tiếp
- Ngoài app chỉ import qua `index.ts` của mỗi layer/slice

## Path aliases (tsconfig + vite)

```ts
'@app/*'      → src/app/*
'@pages/*'    → src/pages/*
'@widgets/*'  → src/widgets/*
'@features/*' → src/features/*
'@entities/*' → src/entities/*
'@shared/*'   → src/shared/*
```

## State management

| Store | Công nghệ | Mục đích |
|-------|-----------|----------|
| `authStore` | Zustand + persist | User, token, login/logout |
| `cartStore` | Zustand | Giỏ hàng (sync với server) |
| `filterStore` | Zustand | Trạng thái bộ lọc shop |
| Server state | TanStack Query | Tất cả API data |

## API endpoints kết nối

| Feature | Endpoints |
|---------|-----------|
| Auth | `POST /auth/login`, `/register` |
| Products | `GET /products`, `/products/{id}`, `/products/slug/{slug}` |
| Variants | `GET /products/{id}/variants` |
| Categories | `GET /categories`, `/categories/roots` |
| Cart | `GET/POST/PUT/DELETE /cart`, `/cart/items/{id}` |
| Orders | `POST /orders`, `GET /orders/my`, `/orders/{id}`, `POST /orders/{id}/cancel` |
| Reviews | `GET/POST /products/{id}/reviews`, `DELETE /products/{id}/reviews/{reviewId}` |
| Admin Products | `POST/PUT/DELETE /products` |
| Admin Variants | `POST/PUT/DELETE /products/{id}/variants` |
| Admin Categories | `POST/PUT/DELETE /categories` |
| Admin Orders | `GET /orders` (paginated), `PATCH /orders/{id}/status` |
