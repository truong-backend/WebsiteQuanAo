# CÁC CHỨC NĂNG ADMIN CHO HỆ THỐNG WEBSITE QUẦN ÁO

## 📋 TỔNG QUAN
Tài liệu này mô tả các chức năng quản trị viên (Admin) cần thiết cho hệ thống bán quần áo trực tuyến.

---

## 🔐 1. QUẢN LÝ TÀI KHOẢN (Account Management)

### 1.1. Quản lý người dùng
- ✅ **Xem danh sách tất cả tài khoản** (đã có - GET /accounts)
- ✅ **Tạo tài khoản mới** (đã có - POST /accounts)
- ✅ **Cập nhật thông tin tài khoản** (đã có - PUT /accounts/{id})
- ✅ **Xóa tài khoản** (cần thêm - DELETE /accounts/{id})
- ✅ **Cập nhật role của tài khoản** (đã có - PUT /accounts/{id}/role)
- ✅ **Tìm kiếm và lọc tài khoản theo role** (đã có)
- 🔄 **Khóa/Mở khóa tài khoản** (cần thêm)
- 🔄 **Reset mật khẩu cho người dùng** (cần thêm)
- 🔄 **Xem lịch sử hoạt động của tài khoản** (cần thêm)

### 1.2. Phân quyền
- 🔄 **Quản lý roles**: ADMIN, USER, STAFF
- 🔄 **Phân quyền chi tiết cho từng role**

---

## 📦 2. QUẢN LÝ SẢN PHẨM (Product Management)

### 2.1. Sản phẩm
- ✅ **Xem danh sách sản phẩm** (đã có - GET /products)
- ✅ **Tạo sản phẩm mới** (đã có - POST /products)
- ✅ **Cập nhật sản phẩm** (đã có - PUT /products/{id})
- ✅ **Xóa sản phẩm** (đã có - DELETE /products/{id})
- ✅ **Xem chi tiết sản phẩm** (đã có - GET /products/{id})
- 🔄 **Ẩn/Hiện sản phẩm** (cần thêm - thêm trường `isActive` hoặc `status`)
- 🔄 **Quản lý số lượng tồn kho** (cần thêm - tích hợp với ProductVariant)
- 🔄 **Thống kê sản phẩm bán chạy** (cần thêm)
- 🔄 **Thống kê sản phẩm tồn kho** (cần thêm)
- 🔄 **Import/Export sản phẩm từ Excel** (cần thêm)

### 2.2. Biến thể sản phẩm (Product Variant)
- ✅ **Quản lý ProductVariant** (đã có controller)
- 🔄 **Quản lý tồn kho theo từng variant** (cần kiểm tra)
- 🔄 **Cập nhật giá theo variant** (cần kiểm tra)

### 2.3. Loại sản phẩm (Product Type)
- ✅ **Quản lý ProductType** (đã có controller)
- 🔄 **Sắp xếp thứ tự hiển thị** (cần thêm)

### 2.4. Màu sắc và Kích thước
- ✅ **Quản lý Color** (đã có controller)
- ✅ **Quản lý Size** (đã có controller)

---

## 📁 3. QUẢN LÝ DANH MỤC (Category Management)

- ✅ **Xem danh sách danh mục** (đã có - GET /categories)
- ✅ **Tạo danh mục mới** (đã có - POST /categories)
- ✅ **Cập nhật danh mục** (đã có - PUT /categories/{id})
- ✅ **Xóa danh mục** (cần kiểm tra - DELETE /categories/{id})
- 🔄 **Quản lý danh mục cha/con** (đã có cấu trúc)
- 🔄 **Sắp xếp thứ tự danh mục** (cần thêm)
- 🔄 **Ẩn/Hiện danh mục** (cần thêm)

---

## 🛒 4. QUẢN LÝ ĐƠN HÀNG (Order Management)

### 4.1. Xem và quản lý đơn hàng
- ✅ **Xem danh sách đơn hàng** (đã có - GET /orders)
- ✅ **Xem chi tiết đơn hàng** (đã có - GET /orders/{id})
- ✅ **Cập nhật đơn hàng** (đã có - PUT /orders/{id})
- ✅ **Xóa đơn hàng** (đã có - DELETE /orders/{id})
- 🔄 **Lọc đơn hàng theo trạng thái** (PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED)
- 🔄 **Lọc đơn hàng theo ngày tháng**
- 🔄 **Lọc đơn hàng theo khách hàng**
- 🔄 **Xuất hóa đơn PDF** (cần thêm)
- 🔄 **In nhãn vận chuyển** (cần thêm)

### 4.2. Xử lý đơn hàng
- 🔄 **Xác nhận đơn hàng** (chuyển từ PENDING → CONFIRMED)
- 🔄 **Cập nhật trạng thái vận chuyển** (CONFIRMED → SHIPPING → COMPLETED)
- 🔄 **Hủy đơn hàng** (chuyển sang CANCELLED)
- 🔄 **Hoàn trả đơn hàng** (cần thêm trạng thái REFUNDED)
- 🔄 **Ghi chú nội bộ cho đơn hàng** (cần thêm trường `adminNote`)

### 4.3. Thống kê đơn hàng
- 🔄 **Thống kê đơn hàng theo ngày/tuần/tháng**
- 🔄 **Thống kê doanh thu**
- 🔄 **Thống kê đơn hàng theo trạng thái**
- 🔄 **Top khách hàng mua nhiều nhất**

---

## 💳 5. QUẢN LÝ THANH TOÁN (Payment Management)

- ✅ **Xem danh sách thanh toán** (đã có controller)
- 🔄 **Xem chi tiết thanh toán**
- 🔄 **Xác nhận thanh toán thủ công**
- 🔄 **Hoàn tiền** (cần thêm)
- 🔄 **Thống kê doanh thu theo phương thức thanh toán**

---

## 📊 6. THỐNG KÊ VÀ BÁO CÁO (Statistics & Reports)

### 6.1. Dashboard
- 🔄 **Tổng quan hệ thống**:
  - Tổng số đơn hàng hôm nay
  - Doanh thu hôm nay/tháng này
  - Số lượng khách hàng mới
  - Số lượng sản phẩm đã bán
  - Đơn hàng đang chờ xử lý

### 6.2. Báo cáo
- 🔄 **Báo cáo doanh thu**:
  - Theo ngày/tuần/tháng/năm
  - Theo sản phẩm
  - Theo danh mục
  - Theo khách hàng
  
- 🔄 **Báo cáo sản phẩm**:
  - Sản phẩm bán chạy nhất
  - Sản phẩm tồn kho nhiều nhất
  - Sản phẩm sắp hết hàng
  
- 🔄 **Báo cáo khách hàng**:
  - Khách hàng mua nhiều nhất
  - Khách hàng mới trong tháng
  - Khách hàng chưa mua lại

### 6.3. Xuất báo cáo
- 🔄 **Xuất Excel/PDF** cho các báo cáo
- 🔄 **Gửi báo cáo tự động qua email** (hàng ngày/tuần/tháng)

---

## 🖼️ 7. QUẢN LÝ HÌNH ẢNH (Image Management)

- 🔄 **Upload hình ảnh sản phẩm**
- 🔄 **Quản lý thư viện hình ảnh**
- 🔄 **Xóa hình ảnh không sử dụng**
- 🔄 **Tối ưu hóa hình ảnh tự động**

---

## ⚙️ 8. CẤU HÌNH HỆ THỐNG (System Configuration)

### 8.1. Cài đặt chung
- 🔄 **Cấu hình thông tin cửa hàng** (tên, địa chỉ, SĐT, email)
- 🔄 **Cấu hình phí vận chuyển**
- 🔄 **Cấu hình mã giảm giá** (nếu có)
- 🔄 **Cấu hình phương thức thanh toán**

### 8.2. Bảo mật
- 🔄 **Quản lý session timeout**
- 🔄 **Quản lý JWT expiration time**
- 🔄 **Xem log đăng nhập**
- 🔄 **Xem log hoạt động admin**

---

## 🔒 9. BẢO MẬT VÀ PHÂN QUYỀN

### 9.1. Cần triển khai ngay
- 🔄 **Phân quyền dựa trên role**:
  - Chỉ ADMIN mới có thể:
    - Xóa sản phẩm/đơn hàng/tài khoản
    - Cập nhật role của người dùng
    - Xem thống kê và báo cáo
    - Cấu hình hệ thống
  
  - USER chỉ có thể:
    - Xem sản phẩm
    - Tạo đơn hàng
    - Xem đơn hàng của mình
    - Quản lý giỏ hàng

### 9.2. Middleware/Filter
- 🔄 **Tạo AdminFilter** để kiểm tra role ADMIN
- 🔄 **Cập nhật SecurityConfiguration** để bảo vệ các endpoint admin
- 🔄 **Tạo annotation @AdminOnly** để đánh dấu các endpoint chỉ dành cho admin

---

## 📝 10. LOG VÀ AUDIT TRAIL

- 🔄 **Ghi log tất cả hành động của admin**:
  - Tạo/sửa/xóa sản phẩm
  - Cập nhật đơn hàng
  - Thay đổi role người dùng
  - Cập nhật cấu hình hệ thống
  
- 🔄 **Xem lịch sử thay đổi** (audit log)
- 🔄 **Export log**

---

## 🎯 ƯU TIÊN TRIỂN KHAI

### Phase 1 - Cấp thiết (Tuần 1-2)
1. ✅ Phân quyền dựa trên role (ADMIN/USER)
2. ✅ Bảo vệ các endpoint admin
3. ✅ Lọc đơn hàng theo trạng thái
4. ✅ Dashboard tổng quan cơ bản

### Phase 2 - Quan trọng (Tuần 3-4)
1. ✅ Thống kê doanh thu
2. ✅ Quản lý tồn kho
3. ✅ Ẩn/Hiện sản phẩm
4. ✅ Khóa/Mở khóa tài khoản

### Phase 3 - Mở rộng (Tuần 5+)
1. ✅ Báo cáo chi tiết
2. ✅ Export Excel/PDF
3. ✅ Audit log
4. ✅ Import/Export sản phẩm

---

## 📌 LƯU Ý

- Hiện tại tất cả endpoint đều `permitAll()` - **CẦN SỬA NGAY** để bảo mật
- Entity `Account` có trường `roles` nhưng chưa có enum - nên tạo enum `Role` (ADMIN, USER, STAFF)
- Cần tạo service và controller riêng cho admin để tách biệt logic
- Nên tạo package `admin` riêng: `com.example.Server.controller.admin`, `com.example.Server.service.admin`

---

## 🔗 CÁC ENDPOINT ADMIN ĐỀ XUẤT

```
/admin/dashboard                    - Dashboard tổng quan
/admin/accounts                     - Quản lý tài khoản (đã có, cần bảo vệ)
/admin/accounts/{id}/lock           - Khóa tài khoản
/admin/accounts/{id}/unlock        - Mở khóa tài khoản
/admin/accounts/{id}/reset-password - Reset mật khẩu
/admin/products                     - Quản lý sản phẩm (đã có, cần bảo vệ)
/admin/products/{id}/toggle-active  - Ẩn/Hiện sản phẩm
/admin/orders                       - Quản lý đơn hàng (đã có, cần bảo vệ)
/admin/orders/{id}/confirm          - Xác nhận đơn hàng
/admin/orders/{id}/ship             - Cập nhật vận chuyển
/admin/orders/{id}/cancel           - Hủy đơn hàng
/admin/statistics/revenue           - Thống kê doanh thu
/admin/statistics/products          - Thống kê sản phẩm
/admin/statistics/customers         - Thống kê khách hàng
/admin/reports/export               - Xuất báo cáo
```

---

*Tài liệu này sẽ được cập nhật khi có thêm yêu cầu hoặc thay đổi trong hệ thống.*
