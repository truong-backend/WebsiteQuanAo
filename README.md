# WebsiteQuanAo — Backend 
> Đề tài: **Xây dựng ứng dụng bán quần áo trực tuyến**  
> Sinh viên thực hiện: **Nguyễn Thanh Trường**

---

## Giới thiệu

Backend của ứng dụng bán quần áo trực tuyến, cung cấp REST API phục vụ các nghiệp vụ: xác thực người dùng, quản lý sản phẩm, đơn hàng, giỏ hàng và thanh toán. Hệ thống được xây dựng bằng **Spring Boot 3** theo kiến trúc phân lớp (Layered Architecture) với bảo mật JWT.

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | Spring Boot 3.5 |
| Bảo mật | Spring Security + JWT (JJWT) |
| ORM | Spring Data JPA (Hibernate) |
| Cơ sở dữ liệu | MySQL 8 |
| Upload file | Cloudinary (qua UploadService) |
| Email | Spring Mail (Gmail SMTP) |
| Thanh toán | VNPay |
| API Docs | Swagger (SpringDoc OpenAPI) |
| Build | Maven |
| IDE | IntelliJ IDEA |

---

## Kiến trúc

Dự án theo kiến trúc **Layered Architecture** tiêu chuẩn Spring Boot:

```
presentation  →  controller/
business      →  service/
data access   →  repository/
data model    →  entity/, dto/, mapper/
cross-cutting →  config/, exception/, enums/
```

### Cấu trúc package

```
src/main/java/com/example/Server/
├── config/                 # Cấu hình bảo mật, JWT, WebSocket, static resource
│   ├── ApplicationConfiguration.java
│   ├── JwtAuthenticationFilter.java
│   ├── SecurityConfiguration.java
│   ├── ChatClientConfig.java
│   ├── StaticResourceConfig.java
│   └── WebSocketConfig.java
├── controller/             # REST Controllers (12 controllers)
│   ├── AuthenticationController.java
│   ├── ProductController.java
│   ├── CategoryController.java
│   ├── CartController.java
│   ├── CartItemController.java
│   ├── OrderController.java
│   ├── OrderItemController.java
│   ├── PaymentController.java
│   ├── AccountController.java
│   ├── ColorController.java
│   ├── SizeController.java
│   ├── ContactController.java
│   ├── ChatController.java
│   └── UploadController.java
├── service/                # Business logic
│   ├── AuthenticationService.java
│   ├── ProductService.java
│   ├── CartService.java, CartItemService.java
│   ├── OrderService.java, OrderItemService.java
│   ├── PaymentService.java
│   ├── AccountService.java
│   ├── CategoryService.java
│   ├── ColorService.java, SizeService.java
│   ├── ContactService.java
│   ├── EmailService.java
│   ├── JwtService.java
│   ├── UploadService.java
│   ├── AiChatService.java
│   ├── MomoService.java, VnpayService.java
│   └── ProactiveWebSocketService.java
├── repository/             # Spring Data JPA Repositories
├── entity/                 # JPA Entities (13 entities)
│   ├── Account.java, Cart.java, CartItem.java
│   ├── Category.java, Color.java, Size.java
│   ├── Product.java, ProductVariant.java
│   ├── Order.java, OrderItem.java, Payment.java
│   ├── Contact.java, ChatMessage.java, BehaviorEvent.java
├── dto/
│   ├── request/            # Request DTOs (phân theo domain)
│   └── response/           # Response DTOs (phân theo domain)
├── mapper/                 # Entity ↔ DTO mappers (thủ công)
├── enums/                  # OrderStatus, ContactStatus, PaymentType
└── exception/              # Custom exceptions + GlobalExceptionHandler
    ├── BaseException.java
    ├── BusinessException.java
    ├── ResourceNotFoundException.java
    ├── AuthenticationException.java
    ├── AuthorizationException.java
    ├── ValidationException.java
    ├── InvalidOperationException.java
    ├── ExternalServiceException.java
    ├── ResourceAlreadyExistsException.java
    └── GlobalExceptionHandler.java
```

---

## Mô hình dữ liệu

Cơ sở dữ liệu MySQL gồm 13 bảng chính:

```
USER, VERIFY_CODE, LOGGED_OUT_TOKEN
PRODUCT_TYPE, PRODUCT, COLOR, SIZE, PRODUCT_VARIANT
CART, CART_ITEM
ORDER, ORDER_ITEM, PAYMENT
```

**Ràng buộc nghiệp vụ chính:**
- Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt
- Đăng nhập sai 5 lần → khóa tài khoản 15 phút
- Email phải được xác thực trước khi đăng nhập
- Mã xác thực hết hạn sau 15 phút
- Giỏ hàng tối đa 10 đơn vị cùng sản phẩm

---

## Chức năng đã thực hiện

### Xác thực & Phân quyền
- [x] Đăng ký tài khoản với xác thực email
- [x] Đăng nhập bằng email/password → trả về JWT access token
- [x] Bảo vệ API theo role (ADMIN / USER)
- [x] Khóa tài khoản sau 5 lần nhập sai mật khẩu
- [x] Đăng xuất (blacklist token)

### Quản lý sản phẩm (Admin)
- [x] CRUD sản phẩm (tên, mô tả, giá, ảnh, loại)
- [x] CRUD biến thể sản phẩm (màu sắc, size, số lượng, ảnh riêng)
- [x] CRUD danh mục (category), màu sắc (color), kích cỡ (size)
- [x] Tìm kiếm, lọc, phân trang sản phẩm
- [x] Upload ảnh sản phẩm lên Cloudinary

### Xem & Tìm kiếm sản phẩm (Public)
- [x] Xem danh sách sản phẩm với phân trang
- [x] Lọc sản phẩm theo tên, danh mục, khoảng giá
- [x] Xem chi tiết sản phẩm
- [x] Xem danh sách danh mục cho navbar

### Quản lý giỏ hàng (Customer)
- [x] Xem giỏ hàng
- [x] Thêm sản phẩm vào giỏ hàng
- [x] Cập nhật số lượng sản phẩm trong giỏ hàng
- [x] Xóa sản phẩm khỏi giỏ hàng
- [x] Thêm nhanh vào giỏ hàng (AddToCart API)

### Đặt hàng & Thanh toán (Customer)
- [x] Tạo đơn hàng từ giỏ hàng
- [x] Thanh toán qua VNPay (sandbox)
- [x] Thanh toán qua MoMo (sandbox)
- [x] Xem lịch sử đơn hàng
- [x] Xem chi tiết đơn hàng

### Quản lý đơn hàng (Admin)
- [x] Xem toàn bộ danh sách đơn hàng
- [x] Tìm kiếm đơn hàng
- [x] Cập nhật trạng thái đơn hàng (PENDING → PROCESSING → SHIPPED → DELIVERED / CANCELLED)

### Quản lý tài khoản (Admin)
- [x] Xem danh sách tài khoản
- [x] Tạo tài khoản mới
- [x] Cập nhật thông tin tài khoản
- [x] Đổi role người dùng
- [x] Đổi mật khẩu

### Liên hệ & Hỗ trợ
- [x] Gửi liên hệ từ khách hàng
- [x] Xem và phản hồi liên hệ (Admin)
- [x] Cập nhật trạng thái liên hệ

### AI Chat
- [x] Chat với AI trợ lý tư vấn sản phẩm (tích hợp Gemini qua Spring AI)
- [x] Gửi/nhận tin nhắn qua WebSocket (STOMP)
- [x] Thu thập BehaviorEvent (hành vi người dùng) để cải thiện gợi ý AI

---

## Cài đặt & Chạy dự án

### Yêu cầu
- Java 17+
- Maven 3.6+
- MySQL 8
- (Tuỳ chọn) Docker

### 1. Clone repository

```bash
git clone <repo-url>
cd WebsiteQuanAo
```

### 2. Cấu hình môi trường

Tạo file `.env` ở thư mục gốc (xem `.env.example`):

```env
DB_URL=jdbc:mysql://localhost:3306/databasequanao?useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_256bit

VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_RETURN_URL=http://localhost:8080/payments/vnpay/return
VNPAY_FRONTEND_RETURN_URL=http://localhost:5173/payment/vnpay-return
VNPAY_IPN_URL=http://your-domain/payments/vnpay/ipn

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

```

### 3. Tạo database

```sql
CREATE DATABASE databasequanao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Chạy ứng dụng

```bash
./mvnw spring-boot:run
```

Hoặc với Docker:

```bash
docker build -t websitequanao-be .
docker run -p 8080:8080 --env-file .env websitequanao-be
```

### 5. Kiểm tra

API mặc định chạy tại: `http://localhost:8080`

---

## API chính

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/auth/register` | Đăng ký tài khoản | Public |
| POST | `/auth/login` | Đăng nhập | Public |
| GET | `/products` | Danh sách sản phẩm (phân trang) | Public |
| GET | `/products/listing` | Danh sách sản phẩm cho trang listing | Public |
| GET | `/products/{id}` | Chi tiết sản phẩm | Public |
| GET | `/cart` | Xem giỏ hàng | USER |
| POST | `/cart/add` | Thêm vào giỏ hàng | USER |
| POST | `/orders` | Tạo đơn hàng | USER |
| GET | `/payments/vnpay` | Tạo link thanh toán VNPay | USER |
| PUT | `/orders/{id}/status` | Cập nhật trạng thái đơn | ADMIN |
| GET | `/accounts` | Danh sách tài khoản | ADMIN |

---

## Thông tin tác giả

- **Sinh viên:** Nguyễn Thanh Trường
- **Trường:** ĐH Công Nghệ Sài Gòn — Khoa CNTT
