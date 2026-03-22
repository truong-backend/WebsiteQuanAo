# 🛍️ Fashion Shop — Full-stack E-commerce

Ứng dụng thương mại điện tử bán quần áo, xây dựng với **Spring Boot** (BE) + **React + TypeScript** (FE).

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [API Overview](#-api-overview)
- [Luồng xác thực](#-luồng-xác-thực)
- [Tích hợp thanh toán](#-tích-hợp-thanh-toán)
- [Phân quyền](#-phân-quyền)
- [Quy tắc code](#-quy-tắc-code)
- [Thêm tính năng mới](#-thêm-tính-năng-mới)

---

## 🎯 Tổng quan

| Tính năng | Mô tả |
|-----------|-------|
| Xem sản phẩm | Danh sách, lọc theo danh mục/giá, xem chi tiết theo slug |
| Giỏ hàng | Thêm/sửa/xóa item, tính tổng tiền, đồng bộ tồn kho |
| Đặt hàng | Mua ngay hoặc từ giỏ hàng, tự động giảm tồn kho |
| Thanh toán | COD, VNPAY, MoMo (sandbox) |
| Tài khoản | Đăng ký, đăng nhập JWT, đổi mật khẩu, xem lịch sử đơn |
| Admin panel | Quản lý sản phẩm, đơn hàng, tài khoản, danh mục, màu sắc, kích thước |
| Liên hệ | Form gửi liên hệ, admin xem + phản hồi qua email |

---

## 🔧 Công nghệ sử dụng

### Backend
- **Java 17** + **Spring Boot 3.x**
- **Spring Security** + **JWT** (jjwt)
- **Spring Data JPA** + **JpaSpecificationExecutor** (filter động)
- **Spring Mail** (gửi email phản hồi liên hệ)
- **Lombok** (giảm boilerplate)
- **MySQL** / **PostgreSQL**

### Frontend
- **React 18** + **TypeScript**
- **React Router v6** (routing + route guard)
- **Axios** (HTTP client + interceptors)
- **SCSS Modules** (styling theo component)

---

## 📁 Cấu trúc dự án

```
project/
├── backend/                          # Spring Boot
│   └── src/main/java/com/example/server/
│       ├── config/                   # Security, JWT filter, CORS, static files
│       ├── controller/               # REST endpoints — nhận request, trả response
│       ├── service/                  # Business logic, @Transactional
│       ├── repository/               # JPA repositories — truy vấn DB
│       ├── entity/                   # JPA entities — ánh xạ bảng DB
│       ├── dto/
│       │   ├── request/              # DTO nhận dữ liệu vào (có @Valid)
│       │   └── response/             # DTO trả dữ liệu ra
│       ├── mapper/                   # Chuyển Entity → Response DTO (static methods)
│       ├── exception/                # BaseException, GlobalExceptionHandler
│       └── enums/                    # OrderStatus, PaymentType
│
└── frontend/                         # React + TypeScript
    └── src/
        ├── api/BaseApi/              # BaseApi class — axios + interceptors
        ├── modules/                  # *Api class + *Service object mỗi domain
        ├── pages/
        │   ├── admin/                # Trang quản trị
        │   └── user/                 # Trang người dùng
        ├── types/                    # TypeScript interfaces, tập trung tại index.ts
        ├── components/               # DynamicList, DynamicForm, AdminModal, ...
        └── routes/                   # AppRoutes + route guards
```

### Luồng request (mỗi request đi qua 5 lớp)

```
HTTP Request
    → JwtAuthFilter          (xác thực token, set SecurityContext)
    → Controller             (validate @Valid, parse params)
    → Service                (business logic, @Transactional)
    → Repository             (truy vấn DB)
    → DB
    ← Entity → Mapper → DTO → JSON
```

---

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu

- Java 17+
- Node.js 18+
- MySQL 8+ hoặc PostgreSQL 14+

### Backend

```bash
# 1. Clone project
git clone <repo-url>
cd backend

# 2. Cấu hình database và biến môi trường (xem phần bên dưới)
cp src/main/resources/application.properties.example src/main/resources/application.properties

# 3. Chạy
./mvnw spring-boot:run
# hoặc build jar
./mvnw clean package -DskipTests
java -jar target/*.jar
```

Backend chạy tại `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`

---

## ⚙️ Biến môi trường

Tạo file `application.properties` (hoặc dùng environment variables):

```properties
# ── Database ──────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/fashionshop
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# ── JWT ───────────────────────────────────────────────────────
security.jwt.secret-key=your-base64-encoded-secret-key-min-256-bits
security.jwt.expiration-time=86400000   # 24h tính bằng ms

# ── VNPAY ─────────────────────────────────────────────────────
vnpay.tmn-code=YOUR_TMN_CODE
vnpay.hash-secret=YOUR_HASH_SECRET
vnpay.pay-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url=http://localhost:8080/payments/vnpay/return
vnpay.frontend-return-url=http://localhost:5173/payment/vnpay-return
vnpay.ipn-url=http://localhost:8080/payments/vnpay/ipn

# ── MoMo ──────────────────────────────────────────────────────
momo.partner-code=MOMO_PARTNER_CODE
momo.access-key=MOMO_ACCESS_KEY
momo.secret-key=MOMO_SECRET_KEY
momo.endpoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.redirect-url=http://localhost:5173/payment/momo-return
momo.ipn-url=http://localhost:8080/payments/momo/ipn

# ── Email (Gmail SMTP — dùng App Password) ────────────────────
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.mail.from=your-email@gmail.com
app.mail.from-name=Shop Support
```

> **Lưu ý:** Không commit file `application.properties` lên Git. Thêm vào `.gitignore`.

---

## 📡 API Overview

### Auth (public)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/signup` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập, nhận JWT token |

### Sản phẩm (public — GET)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/products` | Danh sách có phân trang |
| GET | `/products/listing` | Danh sách với filter danh mục/giá |
| GET | `/products/{id}` | Chi tiết sản phẩm + variants |
| GET | `/products/path/{slug}` | Chi tiết theo URL slug |
| GET | `/categories/navbar` | Danh mục cho navbar |

### Giỏ hàng (yêu cầu đăng nhập)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/carts/me` | Lấy giỏ hàng hiện tại |
| POST | `/carts/me/items` | Thêm sản phẩm vào giỏ |
| PUT | `/carts/me/items/{id}?quantity=3` | Cập nhật số lượng |
| DELETE | `/carts/me/items/{id}` | Xóa item khỏi giỏ |
| DELETE | `/carts/me` | Xóa toàn bộ giỏ |

### Đơn hàng (yêu cầu đăng nhập)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/orders` | Tạo đơn hàng mới |
| GET | `/orders/{id}` | Chi tiết đơn hàng |
| GET | `/orders/me` | Lịch sử đơn hàng |

### Thanh toán
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/payments/vnpay/create` | Tạo URL thanh toán VNPAY |
| POST | `/payments/momo/create` | Tạo URL thanh toán MoMo |
| GET | `/payments/vnpay/return` | VNPAY redirect về (public) |
| GET | `/payments/vnpay/ipn` | VNPAY callback (public) |
| POST | `/payments/momo/ipn` | MoMo callback (public) |

### Liên hệ
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/contacts` | Gửi liên hệ (public) |
| GET | `/contacts` | Danh sách liên hệ (Admin) |
| GET | `/contacts/stats` | Thống kê theo trạng thái (Admin) |
| GET | `/contacts/{id}` | Chi tiết, tự đổi UNREAD→READ (Admin) |
| PATCH | `/contacts/{id}/status` | Đổi trạng thái (Admin) |
| POST | `/contacts/{id}/reply` | Gửi email phản hồi (Admin) |
| DELETE | `/contacts/{id}` | Xóa liên hệ (Admin) |

---

## 🔐 Luồng xác thực

```
1. POST /auth/login  →  nhận { token, expiresIn }
2. Lưu token vào localStorage
3. Mọi request tiếp theo: Header  Authorization: Bearer <token>
4. JwtAuthFilter xác thực token → set SecurityContext
5. Token hết hạn (401) → axios interceptor tự xóa token + redirect /login
```

**Tạo JWT secret key:**
```bash
openssl rand -base64 64
```

---

## 💳 Tích hợp thanh toán

### VNPAY
1. Đăng ký tài khoản sandbox tại [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn)
2. Lấy `TmnCode` và `HashSecret`
3. Điền vào `application.properties`
4. `VnpayService` tạo URL ký HMAC-SHA512 theo chuẩn VNPAY demo

### MoMo
1. Đăng ký tại [developers.momo.vn](https://developers.momo.vn)
2. Lấy `partnerCode`, `accessKey`, `secretKey`
3. `MomoService` gọi API `captureWallet`, ký HMAC-SHA256

### COD
Không cần cấu hình. Đơn đặt với `paymentType: "COD"` sẽ có `payTime = Instant.now()` ngay lập tức.

---

## 👥 Phân quyền

| Role | Quyền |
|------|-------|
| **Guest** | Xem sản phẩm, danh mục, màu sắc, kích thước. Gửi liên hệ. Đăng ký/đăng nhập |
| **ROLE_USER** | Guest + giỏ hàng, tạo đơn hàng, xem đơn của mình, thanh toán, profile |
| **ROLE_ADMIN** | User + quản lý tất cả (account, product, order, category, payment, contact...) |

> **Dev mode:** `SecurityConfiguration` hiện đang `anyRequest().permitAll()`. Bật production mode bằng cách đổi sang method `productionFilterChain()` trước khi deploy.

---

## 📏 Quy tắc code

### Backend

- **Constructor injection** — không dùng `@Autowired` field
- **`@Transactional(TxType.SUPPORTS)`** cho method read-only, mặc định `REQUIRED` cho write
- **Mapper là static class thuần** — không phải Spring bean, không dùng MapStruct
- **UUID làm ID** — `UUID.randomUUID().toString()`, không để DB tự sinh với String ID
- **Normalize input:** `.trim()` + `.toLowerCase()` cho email, `.replaceAll("\\s+", " ")` cho tên
- **Exception hierarchy:** tất cả kế thừa `BaseException` → `GlobalExceptionHandler` bắt tập trung
- **`JpaSpecificationExecutor`** dùng xuyên suốt — filter động không cần viết query tay

### Frontend

- **Tách `*Api` và `*Service`:** `*Api` gọi HTTP, `*Service` xử lý lỗi và expose cho UI
- **Import type từ `@/types`** — không import trực tiếp từ file type con
- **`BaseApi<T>`** là class gốc — mọi domain Api đều extend
- **Axios interceptor** bắt `401` → tự logout và redirect

---

## ➕ Thêm tính năng mới

Ví dụ thêm **Review sản phẩm**:

**Backend (theo thứ tự):**
```
1. entity/Review.java              — @Entity, quan hệ với Product và Account
2. enums/                          — thêm enum nếu cần (VD: ReviewStatus)
3. dto/request/review/             — ReviewCreateRequest.java
4. dto/response/review/            — ReviewResponse.java
5. mapper/ReviewMapper.java        — toResponse() static method
6. repository/ReviewRepository.java
7. service/ReviewService.java      — business logic, @Transactional
8. controller/ReviewController.java — @RestController, @RequestMapping("/reviews")
9. config/SecurityConfiguration    — thêm phân quyền cho endpoint mới
```

**Frontend (theo thứ tự):**
```
1. types/review/review.types.ts    — interface ReviewResponse, ReviewCreateRequest
2. types/index.ts                  — thêm export
3. modules/review/review.module.ts — ReviewApi extends BaseApi + ReviewService
4. modules/index.ts                — export ReviewService
5. pages/user/ReviewSection.tsx    — UI component
6. routes/AppRoutes.tsx            — thêm route nếu cần
```

---

## 🐛 Các vấn đề đã biết

| Vấn đề | Vị trí | Trạng thái |
|--------|--------|------------|
| `MomoConfig`, `VnpayConfig` đặt trong `service/` thay vì `config/` | `service/MomoConfig.java` | Cần di chuyển |
| Security đang `permitAll()` | `SecurityConfiguration.java` | Bật production mode trước deploy |
| `enableAccount()` / `disableAccount()` chưa thực sự hoạt động | `AccountService.java` | Cần thêm field `enabled` vào entity `Account` |
| `RegisterAccount` chưa có `@NotBlank` validation | `dto/request/register/RegisterAccount.java` | Cần thêm |

---

## 📄 License

MIT