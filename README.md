# 👟 Shoes E-commerce Platform

Sàn thương mại điện tử chuyên về **giày dép** — kết nối Người mua, Người bán và Ban quản trị trên một nền tảng duy nhất.

---

## 📖 Giới thiệu chung

**Shoes E-commerce Platform** là một ứng dụng web thương mại điện tử đa người bán *(multi-vendor marketplace)* được xây dựng theo mô hình **C2B2C** (Customer - Business - Customer). Hệ thống cho phép:

- **Người mua (User/Guest)** tìm kiếm, xem sản phẩm, thêm vào giỏ hàng và thanh toán trực tuyến.
- **Người bán (Vendor)** đăng ký cửa hàng, quản lý sản phẩm, đơn hàng, khuyến mãi và theo dõi doanh thu.
- **Điều hành viên (Manager)** kiểm duyệt cửa hàng, sản phẩm và xử lý nội dung vi phạm.
- **Quản trị viên (Admin)** quản lý toàn bộ nền tảng: người dùng, tài chính, cấu hình hệ thống.
- **Giao tiếp thời gian thực** giữa người mua và cửa hàng qua Socket.IO.

---

## 🛠 Công nghệ sử dụng

### Backend (`API_Shoes_Management`)
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Node.js** | 24 (LTS) | Runtime |
| **Express.js** | 5.x | Web framework |
| **MySQL 8** | 8.0 | Cơ sở dữ liệu quan hệ |
| **mysql2** | 3.x | MySQL driver |
| **Socket.IO** | 4.x | Chat & Thông báo thời gian thực |
| **JSON Web Token** | 9.x | Xác thực (accessToken 1h / refreshToken 14d) |
| **bcrypt** | 6.x | Mã hóa mật khẩu |
| **Cloudinary** | 1.x | Lưu trữ ảnh sản phẩm, avatar, banner |
| **Multer** | 2.x | Xử lý upload file |
| **Joi / express-validator** | 18.x / 7.x | Validate request |
| **VNPay** | — | Cổng thanh toán nội địa |
| **MoMo** | — | Ví điện tử |
| **Brevo (Sendinblue SMTP)** | — | Gửi email OTP |
| **node-cron** | — | Tự động hủy đơn hàng quá hạn |
| **exceljs** | — | Xuất báo cáo Excel |

### Frontend (`WEB_Shoes_Management`)
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 19.x | UI Framework |
| **Vite** | 6.x | Build tool |
| **Tailwind CSS** | 4.x | Styling |
| **Redux Toolkit** | 2.x | State management |
| **React Router DOM** | 7.x | Client-side routing |
| **Axios** | 1.x | HTTP client |
| **Socket.IO Client** | — | Kết nối WebSocket |
| **Chart.js / react-chartjs-2** | 4.x | Biểu đồ thống kê |
| **Framer Motion** | 12.x | Hiệu ứng animation |
| **React Hook Form** | 7.x | Quản lý form |
| **Lucide React / React Icons** | — | Icon library |

### DevOps / Infrastructure
| Công nghệ | Mục đích |
|-----------|----------|
| **Docker + Docker Compose** | Container hóa toàn bộ stack |
| **MySQL Init Script** | Khởi tạo schema + dữ liệu mẫu tự động |

---

## ⚡ Chức năng chính

### 🔐 Xác thực (Auth)
- Đăng ký tài khoản với **xác thực OTP qua Email**
- Đăng nhập bảo mật — Token lưu trong **HttpOnly Cookie** (chống XSS)
- Quên mật khẩu qua OTP email
- Tự động làm mới Access Token (Refresh Token rotation)

### 👟 Dành cho Người mua (User / Guest)
- Xem trang chủ, gợi ý sản phẩm thông minh
- Tìm kiếm, lọc sản phẩm theo danh mục / giá / size / màu / đánh giá
- Thêm vào giỏ hàng, quản lý số lượng
- Đặt hàng với 3 phương thức: **COD**, **VNPay**, **MoMo**
- Áp dụng mã khuyến mãi khi thanh toán
- Theo dõi trạng thái đơn hàng, yêu cầu hủy đơn
- Đánh giá sản phẩm và cửa hàng (có ảnh đính kèm)
- Danh sách sản phẩm yêu thích
- **Chat thời gian thực** với cửa hàng
- Nhận **thông báo push** (Socket.IO)

### 🏬 Dành cho Người bán (Vendor)
- Đăng ký và quản lý thông tin cửa hàng (logo, banner, địa chỉ)
- Quản lý sản phẩm: thêm/sửa/xóa + quản lý biến thể (size × màu × giá × tồn kho)
- Xử lý đơn hàng, xác nhận giao hàng, xử lý yêu cầu hủy
- Tạo và quản lý mã khuyến mãi (% hoặc cố định)
- Xem đánh giá, báo cáo đánh giá vi phạm
- Theo dõi **thống kê doanh thu** theo ngày/tháng/năm
- Yêu cầu **rút tiền** (VND), xuất lịch sử giao dịch Excel
- Gửi **đơn cứu xét** khi cửa hàng bị khóa (kèm bằng chứng)

### 🛡 Dành cho Điều hành viên (Manager)
- Phê duyệt / Từ chối / Khóa cửa hàng đăng ký mới
- Phê duyệt / Từ chối sản phẩm đăng bán
- Kiểm duyệt đánh giá bị báo cáo (Ẩn / Giữ nguyên)
- Xử lý đơn cứu xét của cửa hàng bị khóa

### 👑 Dành cho Quản trị viên (Admin)
- Quản lý toàn bộ người dùng (thêm/sửa/xóa/phân quyền hàng loạt)
- Quản lý cửa hàng, điều chỉnh phí hoa hồng, cưỡng chế số dư ví
- Quản lý đơn hàng toàn sàn, ép hủy đơn tranh chấp
- Quản lý danh mục sản phẩm (cây phân cấp)
- Quản lý biến thể toàn cầu (Size, Color)
- Phê duyệt / từ chối yêu cầu rút tiền của Vendor
- Xem **thống kê tài chính** toàn sàn (doanh thu, phí sàn, top store)
- Cấu hình hệ thống (phí sàn %, email hỗ trợ, chế độ bảo trì)

---

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống
- **Docker Desktop** ≥ 4.x (khuyến nghị) **hoặc** Node.js 20+ & MySQL 8
- **Git**
- RAM tối thiểu: 4 GB

---

### ▶ Cách 1: Chạy bằng Docker Compose (Khuyến nghị)

```bash
# 1. Clone repository
git clone <repo-url>
cd Shoes-Ecommerce-Platform

# 2. Tạo file môi trường cho Backend
cp API_Shoes_Management/.env.example API_Shoes_Management/.env
# → Mở file .env và điền đầy đủ các biến (xem mục Biến môi trường bên dưới)

# 3. Khởi động toàn bộ hệ thống (backend + frontend + mysql)
docker compose up --build

# 4. Truy cập
# Backend API : http://localhost:3000
# Frontend    : http://localhost:5173
# MySQL DB    : localhost:3307 (user: root / pass: 123456)
```

> **Lần đầu khởi động:** Docker sẽ tự động chạy `mysql_init/shoes_data.sql` để tạo schema và dữ liệu mẫu.

---

### ▶ Cách 2: Chạy thủ công (Manual)

#### 2.1 Chuẩn bị MySQL
```sql
-- Tạo database
CREATE DATABASE shoes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Import schema + data mẫu
mysql -u root -p shoes < mysql_init/shoes_data.sql
```

#### 2.2 Chạy Backend
```bash
cd API_Shoes_Management
cp .env.example .env   # điền biến môi trường
npm install
npm run dev            # chạy development (nodemon + babel-node)
# → http://localhost:3000
```

#### 2.3 Chạy Frontend
```bash
cd WEB_Shoes_Management
npm install
npm run dev
# → http://localhost:5173
```

---

### 🔑 Biến môi trường Backend (`API_Shoes_Management/.env`)

```env
# Server
APP_PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=shoes
DB_PORT=3307

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=1h
JWT_REFRESH_EXPIRE=14d

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo SMTP (https://app.brevo.com)
BREVO_SMTP_USER=your_smtp_user
BREVO_API_KEY=your_api_key

# VNPay
VNP_TMN_CODE=your_terminal_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_BACKEND_RETURN_URL=http://localhost:3000/api/orders/vnpay-return

# MoMo
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_API_URL=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_BACKEND_RETURN_URL=http://localhost:3000/api/orders/momo-ipn

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 📋 Hướng dẫn sử dụng cơ bản

### 🧪 Test API với Postman

1. Mở **Postman** → **Import** → chọn file `ShoesEcommerce_Postman_Collection.json`
2. Vào **Environments** → tạo Environment mới với biến:
   - `baseUrl` = `http://localhost:3000`
3. Chọn Environment vừa tạo
4. **Bật Cookie Manager:** Postman Settings → General → ✅ *Automatically follow redirects* + sử dụng **Cookie Jar** để lưu HttpOnly cookie sau khi đăng nhập

#### Luồng test cơ bản:
```
1. POST /api/auth/register      → Đăng ký tài khoản
2. POST /api/auth/verify-otp    → Xác minh OTP email
3. POST /api/auth/login         → Đăng nhập (lấy Cookie)
4. GET  /api/users/profile      → Xem thông tin cá nhân
5. GET  /api/products/homepage-products → Xem trang chủ
```

---

### 👤 Phân quyền và tài khoản mẫu

| Role | Email mẫu | Mật khẩu | Quyền hạn |
|------|-----------|----------|-----------|
| **Admin** | `23110233@student.hcmute.edu.vn` | `123456` | Toàn quyền hệ thống |
| **Manager** | `huu.pham.3101@gmail.com` | `123456` | Kiểm duyệt nội dung |
| **Vendor** | `phamngochuu3101@gmail.com` | `123456` | Quản lý cửa hàng + sản phẩm |
| **User** | `23110332@student.hcmute.edu.vn` | `123456` | Mua sắm, đánh giá, chat |

> ⚠️ Tài khoản mẫu được tạo sẵn từ file `mysql_init/shoes_data.sql`. Thay đổi mật khẩu sau khi deploy production.

---

### 🛒 Luồng mua hàng điển hình (User)

```
1. Đăng ký / Đăng nhập
2. Tìm kiếm sản phẩm: GET /api/products/search-filter?search=nike
3. Xem chi tiết: GET /api/products/detail/{slug}
4. Thêm vào giỏ: POST /api/carts/add
5. Áp mã giảm giá: POST /api/promotions/apply
6. Đặt hàng COD: POST /api/orders/checkout-cod
        hoặc VNPay: POST /api/orders/checkout-online (paymentMethod: "vnpay")
7. Theo dõi đơn: GET /api/orders/history
8. Đánh giá sau khi nhận hàng: POST /api/orders/{orderId}/reviews
```

### 🏬 Luồng bán hàng điển hình (Vendor)

```
1. Đăng ký cửa hàng: POST /api/vendor/stores/register
2. Chờ Manager phê duyệt
3. Đăng sản phẩm: POST /api/vendor/products/add
4. Thêm biến thể: POST /api/vendor/products/add/{id}/variants
5. Chờ Manager duyệt sản phẩm
6. Xem đơn hàng: GET /api/vendor/orders
7. Xác nhận giao hàng: PUT /api/vendor/orders/{id}/update-status
8. Rút tiền: POST /api/vendor/payouts/request
```

---

## 🗂 Cấu trúc thư mục

```
Shoes-Ecommerce-Platform/
├── docker-compose.yml              # Orchestration: Backend + Frontend + MySQL
├── mysql_init/
│   └── shoes_data.sql              # Schema DB + dữ liệu mẫu
├── API_Shoes_Management/           # Backend Node.js/Express
│   ├── src/
│   │   ├── server.js               # Entry point + route mounting
│   │   ├── config/                 # DB, CORS, biến môi trường
│   │   ├── controllers/            # Xử lý business logic (auth/admin/vendor/user/manager)
│   │   ├── models/                 # Truy vấn MySQL
│   │   ├── routes/                 # Định nghĩa endpoint
│   │   ├── middlewares/            # Auth guard, validation, maintenance
│   │   ├── services/               # Service layer
│   │   ├── providers/              # Cloudinary, JWT, Email, VNPay, MoMo, Socket
│   │   ├── validations/            # Joi schema validation
│   │   ├── jobs/                   # Cron jobs (tự động hủy đơn)
│   │   └── utils/                  # Hằng số, OTP generator
│   └── Dockerfile
├── WEB_Shoes_Management/           # Frontend React/Vite
│   ├── src/
│   │   ├── pages/                  # Trang UI (admin/vendor/user/manager/auth)
│   │   ├── components/             # Reusable components
│   │   ├── redux/                  # Redux Toolkit store + slices
│   │   ├── services/               # Axios API calls
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── layouts/                # Layout theo role
│   │   └── utils/                  # Axios instance, formatters, constants
├── Dockerfile
└── ShoesEcommerce_Postman_Collection.json
```

---

## 🔌 Kiến trúc hệ thống

```
┌─────────────────┐     HTTP/REST     ┌──────────────────┐
│  React Frontend │ ◄───────────────► │  Express Backend │
│  (Port 5173)    │                   │  (Port 3000)     │
└─────────────────┘     Socket.IO     └────────┬─────────┘
                        (Real-time)            │
                                     ┌─────────┼──────────┐
                                     │         │          │
                               ┌─────▼───┐ ┌──▼────┐ ┌───▼──────┐
                               │ MySQL 8 │ │Cloud- │ │  Brevo   │
                               │(Port    │ │inary  │ │  SMTP    │
                               │ 3307)   │ │(Media)│ │  (Email) │
                               └─────────┘ └───────┘ └──────────┘
```

---

## 📝 License

ISC License — Dự án học thuật, không sử dụng cho mục đích thương mại.
