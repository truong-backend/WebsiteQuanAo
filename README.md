# WebsiteQuanAo — Frontend

> Đồ án tốt nghiệp — Trường ĐH Công Nghệ Sài Gòn, Khoa CNTT  
> Đề tài: **Xây dựng ứng dụng bán quần áo trực tuyến**  
> Người hướng dẫn: ThS. Nguyễn Kiều Oanh  
> Sinh viên thực hiện: **Nguyễn Thanh Trường**

---

## Giới thiệu

Frontend của ứng dụng bán quần áo trực tuyến, xây dựng bằng **React 19 + Vite + TypeScript** theo kiến trúc **Feature-Sliced Design (FSD)**. Ứng dụng hỗ trợ hai giao diện riêng biệt: giao diện khách hàng và giao diện quản trị viên, với thiết kế responsive tông màu đen-trắng-xám, tải trang dưới 2 giây.

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Ngôn ngữ | TypeScript 5.9 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Styling | Tailwind CSS 4 + SCSS Modules |
| UI Components | MUI (Material UI) v7, Ant Design v6 |
| Icons | Lucide React |
| WebSocket | STOMP.js + SockJS |
| Linting | ESLint 9 |
| IDE | Visual Studio Code |

---

## Kiến trúc

Dự án áp dụng **Feature-Sliced Design (FSD)** — tổ chức code theo domain/feature thay vì theo loại file, giúp dễ mở rộng và bảo trì.

### Cấu trúc thư mục

```
src/
├── pages/                  # Static pages (không thuộc feature cụ thể)
│   └── user/
│       ├── HomePage.tsx
│       ├── AboutPage.tsx
│       ├── ContactPage.tsx
│       ├── NotFoundPage.tsx
│       ├── ReturnPolicyPage.tsx
│       ├── ShoppingGuidePage.tsx
│       └── WishlistPage.tsx
├── layouts/                # Layout wrappers
│   ├── user/
│   │   ├── PageLayout.tsx       # Layout chung cho trang user
│   │   └── ProfileLayout.tsx    # Layout trang cá nhân
│   └── admin/
│       ├── AdminLayout.tsx      # Layout dashboard admin
│       └── AdminPageState.tsx   # Loading/error state cho admin
├── features/               # Feature modules (FSD core)
│   ├── auth/               # Đăng nhập, đăng ký
│   │   ├── api/            # authApi.ts
│   │   ├── services/       # authService.ts
│   │   ├── hooks/          # useAuth.ts
│   │   ├── types/          # auth.types.ts
│   │   ├── constants/      # auth.constants.ts
│   │   ├── components/     # LoginPage, RegisterPage
│   │   └── index.ts        # Barrel export
│   ├── products/           # Xem & tìm kiếm sản phẩm
│   │   ├── api/, services/, hooks/, types/, constants/
│   │   └── components/     # ProductListingPage, ProductDetailPage, ProductCard
│   ├── cart/               # Giỏ hàng
│   │   ├── services/       # cartItemService, localCartService, serverCartService
│   │   ├── hooks/          # useCart.ts
│   │   └── components/     # CartPage, CheckoutPage
│   ├── orders/             # Đơn hàng & thanh toán
│   │   ├── services/       # orderService, paymentService, paymentGatewayService
│   │   └── components/     # OrderStatusPage, OrderInvoicePage, OrderTrackingPage, VnpayReturnPage
│   ├── account/            # Hồ sơ cá nhân
│   │   └── components/     # ProfilePage, OrderHistoryPage
│   ├── categories/         # Danh mục sản phẩm
│   └── admin/              # Quản trị viên
│       ├── api/            # colorApi, sizeApi, contactApi, productVariantApi
│       ├── services/       # colorService, sizeService, contactService, uploadService
│       ├── types/          # color, size, contact, productVariant types
│       └── components/     # AccountPage, CategoryPage, ProductPage, ProductVariantPage,
│                           #  ColorPage, SizePage, OrderPage, ContactPage
├── components/             # Shared components (dùng lại nhiều feature)
│   ├── user/
│   │   ├── layout/         # Navbar, Footer
│   │   └── ui/             # Button, Loading, ErrorAlert, EmptyState,
│   │                       #  ProductCard, StatusChip, PriceText, Sidebar, BackButton
│   └── admin/
│       ├── Dynamic/        # DynamicForm, DynamicList (generic admin table/form)
│       └── ui/             # AdminModal
├── routes/
│   └── AppRoutes.tsx       # React Router — định nghĩa toàn bộ route + guard
├── services/
│   └── baseApi.ts          # BaseApi class generic (Axios wrapper)
├── types/
│   └── common.types.ts     # Shared TypeScript types
└── main.tsx
```

---

## Chức năng đã thực hiện

### Phía người dùng chưa đăng nhập
- [x] Xem trang chủ, giới thiệu, chính sách
- [x] Đăng ký tài khoản với validation form
- [x] Đăng nhập với email/password
- [x] Xem danh sách sản phẩm với phân trang
- [x] Lọc sản phẩm theo tên, danh mục, khoảng giá
- [x] Xem chi tiết sản phẩm (ảnh, mô tả, biến thể màu/size)

### Phía khách hàng
- [x] Quản lý giỏ hàng (thêm, xoá, cập nhật số lượng)
- [x] Giỏ hàng local (lưu localStorage khi chưa đăng nhập) + đồng bộ lên server khi đăng nhập
- [x] Thanh toán qua VNPay — xử lý callback return URL
- [x] Theo dõi trạng thái đơn hàng (OrderStatusPage, OrderTrackingPage)
- [x] Xem hoá đơn đơn hàng (OrderInvoicePage)
- [x] Xem lịch sử đơn hàng (OrderHistoryPage)
- [x] Cập nhật hồ sơ cá nhân (ProfilePage)
- [x] Wishlist sản phẩm (WishlistPage)

### Phía quản trị viên
- [x] Dashboard bảo vệ bằng AdminRoute (redirect nếu không có quyền)
- [x] Quản lý tài khoản — xem danh sách, tạo mới, đổi role
- [x] Quản lý sản phẩm — CRUD đầy đủ, upload ảnh
- [x] Quản lý biến thể sản phẩm (ProductVariantPage)
- [x] Quản lý danh mục sản phẩm (CategoryPage)
- [x] Quản lý màu sắc (ColorPage) và kích cỡ (SizePage)
- [x] Quản lý đơn hàng — xem, cập nhật trạng thái
- [x] Quản lý liên hệ — xem, phản hồi, cập nhật trạng thái
- [x] DynamicForm / DynamicList — component generic tái sử dụng cho các trang admin

### Kỹ thuật & UX
- [x] Route guard: `ProtectedRoute` (yêu cầu đăng nhập) và `AdminRoute` (yêu cầu role ADMIN)
- [x] `BaseApi` class generic TypeScript — DRY cho tất cả API calls (getAll, getById, create, update, delete, customGet/Post/Put/Delete)
- [x] Axios interceptor tự động gắn Bearer token và xử lý 401 (logout tự động)
- [x] CSS Modules (`.module.scss`) co-location với component
- [x] Barrel exports (`index.ts`) cho mỗi feature
- [x] Responsive design — hoạt động tốt trên desktop, tablet, mobile
- [x] Tông màu đen-trắng-xám nhất quán toàn bộ ứng dụng

---

## Cài đặt & Chạy dự án

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### 1. Clone repository

```bash
git clone <repo-url>
cd WebsiteQuanAoFE
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` ở thư mục gốc:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> ⚠️ **Không commit file `.env` lên Git.** Thêm vào `.gitignore`.

### 4. Chạy development server

```bash
npm run dev
```

Ứng dụng mặc định chạy tại: `http://localhost:5173`

### 5. Build production

```bash
npm run build
```

---

## Tài khoản mặc định (dev)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| User | user@example.com | User@123 |

---

## Thông tin tác giả

- **Sinh viên:** Nguyễn Thanh Trường
- **Trường:** ĐH Công Nghệ Sài Gòn — Khoa CNTT
- **Năm học:** 2024–2025
