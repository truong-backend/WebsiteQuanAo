# 🛍️ Website Quản Lý Bán Quần Áo

> **Luận văn tốt nghiệp 2025** — Hệ thống e-commerce quản lý bán quần áo hoàn chỉnh, tích hợp thanh toán VNPay thực tế.

🔗 **Demo:** [website-quan-ao.vercel.app](https://website-quan-ao.vercel.app)
📦 **Repo: ** FE: [github.com/truong-backend/WebsiteQuanAo](https://github.com/truong-backend/WebsiteQuanAo)
          ** BE: https://github.com/truong-backend/WebsiteQuanAo/tree/backend
---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 17 · Spring Boot 3 · Spring Security · JPA/Hibernate |
| **Authentication** | JWT (JSON Web Token) · Role-based access control |
| **Frontend** | React 18 · TypeScript · MUI (Material UI) |
| **Database** | MySQL · Stored Procedure · Trigger · Backup/Restore |
| **Payment** | VNPay Payment Gateway (tích hợp thực tế) |
| **Deploy** | Vercel (Frontend) · Railway (Backend) |
| **Tools** | Git · Postman · Jira |

---

## 📋 Chức năng hệ thống

### 👤 Phía người dùng (User)
- Đăng ký / Đăng nhập (JWT)
- Xem danh sách sản phẩm, lọc theo danh mục / màu sắc / kích cỡ
- Xem chi tiết sản phẩm và biến thể
- Thêm vào giỏ hàng, quản lý giỏ hàng
- Đặt hàng và thanh toán qua **VNPay**
- Xem lịch sử đơn hàng và trạng thái

### 🛠️ Phía quản trị (Admin)
- Quản lý tài khoản người dùng
- Quản lý danh mục sản phẩm
- Quản lý sản phẩm (thêm / sửa / xoá)
- Quản lý biến thể sản phẩm (màu sắc · kích cỡ)
- Quản lý đơn hàng & cập nhật trạng thái
- Quản lý thanh toán & xác nhận giao dịch VNPay

---

## 🏗️ Kiến trúc Backend

```
Controller  →  Service  →  Repository  →  Database
     ↕              ↕
    DTO          Mapper
```

- **Controller:** Nhận request, validate đầu vào, trả response
- **Service:** Xử lý logic nghiệp vụ
- **Repository:** Tương tác database qua JPA
- **DTO:** Chỉ expose dữ liệu cần thiết ra ngoài
- **Mapper:** Convert giữa Entity ↔ DTO

---

## 🗄️ Database Design

Thiết kế database theo quy trình đầy đủ:

```
Phân tích yêu cầu
       ↓
  Vẽ ERD (mức ý niệm)
       ↓
  Mô hình lý luận
       ↓
  Mô hình vật lý
       ↓
  Triển khai SQL
```

**Các bảng chính:**
`users` · `roles` · `categories` · `products` · `product_variants` · `colors` · `sizes` · `orders` · `order_details` · `payments`

**Database features:**
- Stored Procedures xử lý logic phức tạp
- Triggers tự động cập nhật trạng thái
- Phân quyền user DB theo nguyên tắc tối thiểu
- Backup & Restore strategy

---

## 💳 Tích hợp VNPay

- Tạo URL thanh toán VNPay từ backend
- Xử lý callback và xác thực chữ ký HMAC-SHA512
- Cập nhật trạng thái đơn hàng sau khi thanh toán thành công
- Hỗ trợ môi trường sandbox và production

---

## 🔐 Bảo mật

- JWT Authentication với Access Token
- Spring Security phân quyền `ROLE_USER` / `ROLE_ADMIN`
- Password mã hóa BCrypt
- API endpoint bảo vệ theo role

---

## 📁 Cấu trúc project

```
WebsiteQuanAo/
├── Client/                  # Frontend React TypeScript
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── page/
│   │   │   ├── User/        # Trang người dùng
│   │   │   └── Admin/       # Trang quản trị
│   │   ├── service/         # API calls
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/
│   └── package.json
│
└── Server/                  # Backend Spring Boot
    └── src/main/java/
        ├── controller/      # REST API endpoints
        ├── service/         # Business logic
        ├── repository/      # Data access layer
        ├── entity/          # JPA Entities
        ├── dto/             # Data Transfer Objects
        ├── mapper/          # Entity ↔ DTO conversion
        ├── security/        # JWT & Spring Security
        └── config/          # App configuration
```

---

## ⚙️ Hướng dẫn chạy local

### Yêu cầu
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Backend
```bash
# 1. Clone repo
git clone https://github.com/truong-backend/WebsiteQuanAo.git
cd WebsiteQuanAo

# 2. Tạo database
mysql -u root -p
CREATE DATABASE websitequanao;

# 3. Cấu hình application.properties
# Sửa DB credentials và VNPay config

# 4. Chạy
cd Server
mvn spring-boot:run
```

### Frontend
```bash
cd Client
npm install
npm run dev
# Mở http://localhost:5173
```

---

## 📐 Tài liệu phân tích 
Dự án bao gồm tài liệu phân tích đầy đủ:
- ✅ Đặc tả yêu cầu chức năng & phi chức năng
- ✅ Sơ đồ Use Case
- ✅ Sơ đồ tuần tự (Sequence Diagram)
- ✅ Sơ đồ hoạt động (Activity Diagram)
- ✅ Sơ đồ chức năng
- ✅ ERD & Mô hình dữ liệu logic
- ✅ Ràng buộc nghiệp vụ

---

## 👨‍💻 Tác giả

**Nguyễn Thanh Trường**
- 📧 honguyententhanhtruong@gmail.com
- 📱 0981 907 754
- 🎓 Kỹ sư CNTT — ĐH Công Nghệ Sài Gòn (STU) · 2025

---

> *Toàn bộ project được thực hiện độc lập: từ phân tích nghiệp vụ, thiết kế database, lập trình Backend & Frontend đến deploy production.*
