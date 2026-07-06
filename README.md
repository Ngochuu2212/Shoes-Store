# 👟 Shoes E-commerce Platform

Sàn thương mại điện tử chuyên biệt về **giày dép** — một giải pháp toàn diện kết nối người dùng (User), nhà bán hàng (Vendor), nhân viên giao hàng (Shipper), ban kiểm duyệt (Manager) và tổng quản trị (Admin) trên một hệ thống duy nhất.

---

## 📖 Giới thiệu chung

**Shoes E-commerce Platform** được xây dựng theo mô hình sàn thương mại điện tử đa người bán *(multi-vendor marketplace)*, áp dụng mô hình vận hành hiện đại và quy trình khép kín:

*   **Người mua (User/Guest)**: Xem sản phẩm, tìm kiếm thông minh bằng hình ảnh (AI Visual Search), tương tác với trợ lý ảo (AI Chatbot), áp dụng mã giảm giá, đặt hàng qua COD/VNPay/MoMo/Ví điện tử, theo dõi đơn hàng và yêu cầu hoàn trả khi cần thiết.
*   **Người bán (Vendor)**: Quản lý gian hàng cá nhân, đăng bán sản phẩm và cấu hình các biến thể (size, màu sắc, giá bán, tồn kho), phê duyệt/từ chối yêu cầu hoàn trả, tạo mã khuyến mãi, rút tiền từ doanh thu ví, và gửi đơn cứu xét khi gian hàng bị khóa.
*   **Nhân viên giao hàng (Shipper)**: Tiếp nhận đơn hàng mới và đơn hàng hoàn trả từ danh sách đơn chung, cập nhật lộ trình giao hàng (Nhận đơn -> Đang lấy hàng -> Đang giao -> Hoàn tất), chụp ảnh làm bằng chứng giao hàng hoặc thu hồi hàng.
*   **Điều hành viên (Manager)**: Duyệt các gian hàng đăng ký mới, duyệt sản phẩm đăng bán, xử lý khiếu nại đánh giá vi phạm, và xử lý đơn cứu xét từ các gian hàng bị khóa.
*   **Quản trị viên (Admin)**: Quản lý và phân quyền người dùng, điều chỉnh mức phí hoa hồng của sàn, cưỡng chế số dư ví, quản lý và phê duyệt yêu cầu rút tiền của Vendor, và xem báo cáo tài chính tổng quan toàn sàn.

---

## 🛠 Công nghệ sử dụng

### Phân hệ Backend (`API_Shoes_Management`)

| Công nghệ | Phiên bản | Mục đích |
| :--- | :--- | :--- |
| **Node.js** | 24 (LTS) | Runtime chạy ứng dụng |
| **Express.js** | 5.x | Web framework |
| **MySQL 8** | 8.0 | Cơ sở dữ liệu quan hệ lưu trữ dữ liệu chính |
| **Socket.IO** | 4.x | Giao tiếp thời gian thực (Chat & Thông báo hệ thống) |
| **Google Generative AI SDK** | 0.2.x | Tích hợp **Gemini 2.5 Flash** cho Chatbot và Visual Search |
| **Google Auth Library** | 9.x | Xác thực và xác minh Google ID Token cho Google Login |
| **JSON Web Token (JWT)** | 9.x | Xác thực người dùng (AccessToken 1h / Refresh Token 14d) |
| **Cloudinary SDK** | 1.x | Lưu trữ phương tiện (Ảnh đại diện, sản phẩm, bằng chứng giao hàng) |
| **VNPay / MoMo API** | — | Cổng thanh toán trực tuyến và Ví điện tử sandbox |
| **Brevo (Sendinblue SMTP)** | — | Gửi email mã OTP xác minh tài khoản, khôi phục mật khẩu |
| **node-cron** | — | Tự động quét và hủy các đơn hàng chưa thanh toán quá hạn |
| **exceljs** | — | Xuất báo cáo tài chính, lịch sử ví ra file Excel |

### Phân hệ Frontend (`WEB_Shoes_Management`)

| Công nghệ | Phiên bản | Mục đích |
| :--- | :--- | :--- |
| **React** | 19.x | Thư viện UI xây dựng giao diện |
| **Vite** | 8.x | Công cụ build frontend nhanh gọn |
| **Tailwind CSS** | 4.x | Styling giao diện linh hoạt |
| **Redux Toolkit & Persist** | 2.x | Quản lý state toàn cục và lưu trữ bộ nhớ đệm client |
| **React Router DOM** | 7.x | Quản lý định tuyến phía client-side |
| **Google OAuth React SDK** | 1.x | Nút đăng nhập Google trực quan tích hợp nhanh |
| **Axios** | 1.x | HTTP Client gọi API kết nối backend |
| **Chart.js / react-chartjs-2** | 4.x | Vẽ biểu đồ thống kê doanh thu cho Vendor, Shipper & Admin |
| **Framer Motion** | 12.x | Hiệu ứng chuyển động mượt mà, sống động |

---

## ⚡ Các tính năng nổi bật mới tích hợp

### 1. 🔐 Đăng nhập bằng Google (Google OAuth2)
*   Cho phép người dùng đăng nhập tức thì thông qua tài khoản Google.
*   **Tự động liên kết**: Nếu email Google đã tồn tại trong hệ thống dưới dạng tài khoản thường, hệ thống sẽ tự động liên kết Google ID vào tài khoản đó. Nếu chưa tồn tại, hệ thống tự động tạo tài khoản người dùng mới và lấy ảnh đại diện trực tiếp từ Google.

### 2. 🤖 Trợ lý ảo AI & Tìm kiếm hình ảnh (Google Gemini 2.5 Flash)
*   **AI Chatbot CSKH**: Trò chuyện thời gian thực với khách hàng, tư vấn phong cách, gợi ý mẫu mã phù hợp dựa trên ngữ cảnh là danh sách các sản phẩm bán chạy nhất được nạp trực tiếp vào bộ nhớ của AI.
*   **Tìm kiếm bằng hình ảnh (AI Visual Search)**: Khách hàng chỉ cần tải lên 1 bức ảnh đôi giày. Gemini sẽ phân tích các chi tiết (màu sắc, kiểu dáng, thương hiệu) để trích xuất các từ khóa đặc trưng. Backend sẽ dựa trên các từ khóa này để truy vấn SQL tính điểm trùng khớp và xếp hạng các sản phẩm giống nhất trong DB để trả về cho người dùng.

### 3. 📦 Quy trình Trả hàng & Hoàn tiền tự động (Refund/Return Flow)
*   **Yêu cầu trả hàng**: Khách hàng có thể gửi yêu cầu trả hàng đối với các đơn hàng ở trạng thái `completed`, bắt buộc nhập lý do trả hàng.
*   **Vendor kiểm duyệt**: Nhà bán hàng xem xét lý do trả hàng để chọn **Chấp nhận** hoặc **Từ chối**.
*   **Shipper thu hồi ngược**: Khi Vendor đồng ý, đơn hàng được chuyển vào danh sách đơn chờ của Shipper với loại đơn **"Trả hàng"**. Shipper đến lấy hàng từ Khách hàng, mang trả lại cho Shop và tải lên ảnh bằng chứng thu hồi.
*   **Hoàn tiền tự động qua Ví**: Khi Shipper hoàn tất đơn trả hàng, hệ thống tự động:
    1.  Trừ số tiền doanh thu tương ứng trong ví số dư của Cửa hàng (`stores.balance`).
    2.  Cộng hoàn trả 100% giá trị đơn hàng vào ví người dùng của Khách hàng (`users.wallet_balance`).
    3.  Tạo bản ghi lịch sử giao dịch ví dạng `REFUND`.

### 4. 🚚 Vai trò mới: Nhân viên giao hàng (Shipper)
*   **Dashboard Thống kê**: Theo dõi trực quan tổng số đơn đã giao, doanh thu giao hàng nhận được và biểu đồ thu nhập theo thời gian.
*   **Bể đơn hàng chờ nhận (Available Orders)**: Nhận các đơn giao hàng mới (từ Shop đến Khách) và các đơn thu hồi (từ Khách về Shop) trên cùng một giao diện.
*   **Lộ trình giao hàng trực quan**: Cập nhật trạng thái từng bước kèm nút gọi điện nhanh cho Khách/Shop, tải ảnh minh chứng giao hàng thành công bằng Cloudinary.

---

## 👥 Danh sách tài khoản mẫu để kiểm thử ở Local

Dữ liệu dưới đây được tạo sẵn từ file khởi tạo cơ sở dữ liệu `mysql_init/shoes_data.sql`:

| Vai trò (Role) | Email tài khoản | Mật khẩu | Quyền hạn & Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Admin** | `23110233@student.hcmute.edu.vn` | `123456` | Quản lý người dùng, duyệt yêu cầu rút tiền, cấu hình phí sàn, quản lý ví hệ thống, xem báo cáo tài chính toàn sàn. |
| **Manager** | `huu.pham.3101@gmail.com` | `123456` | Duyệt cửa hàng đăng ký mới, duyệt sản phẩm đăng bán, ẩn/hiện các đánh giá bị báo cáo vi phạm, giải quyết đơn cứu xét của Vendor. |
| **Vendor** | `phamngochuu3101@gmail.com` | `123456` | Đăng sản phẩm và biến thể, xử lý đơn hàng/đơn hoàn trả, quản lý mã giảm giá cá nhân, yêu cầu rút tiền về ngân hàng. |
| **Shipper** | `shipper@gmail.com` | `123456` | Nhận đơn giao hàng và đơn trả hàng, cập nhật lộ trình giao nhận, chụp ảnh bằng chứng giao hàng, theo dõi thu nhập. |
| **User** | `23110332@student.hcmute.edu.vn` | `123456` | Tìm kiếm, mua sắm sản phẩm, thanh toán VNPay/COD/Ví, yêu cầu trả hàng, trò chuyện với Shop và AI Chatbot. |

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
*   **Docker Desktop** (Khuyên dùng để khởi chạy nhanh) **HOẶC** Node.js v20+ & MySQL 8.0+ cài trên máy.
*   Tài khoản Cloudinary và Brevo SMTP để cấu hình các tính năng upload ảnh và gửi mail OTP.

---

### ▶ Cách 1: Chạy nhanh bằng Docker Compose (Khuyên dùng)

1.  **Tải mã nguồn về máy**:
    ```bash
    git clone https://github.com/Ngochuu2212/Shoes-Store.git
    cd Shoes-Store
    ```

2.  **Cấu hình biến môi trường**:
    Tạo file cấu hình môi trường cho Backend:
    ```bash
    cp API_Shoes_Management/.env.example API_Shoes_Management/.env
    ```
    *Mở file `API_Shoes_Management/.env` vừa tạo và cập nhật các thông tin cấu hình cần thiết (như `GEMINI_API_KEY`, `CLOUDINARY_URL`, `BREVO_API_KEY`...)*.

3.  **Khởi động Containers**:
    ```bash
    docker compose up --build
    ```

4.  **Truy cập ứng dụng**:
    *   **Giao diện Website (Frontend)**: [http://localhost:5173](http://localhost:5173)
    *   **Cổng API (Backend)**: [http://localhost:3000](http://localhost:3000)
    *   **Cơ sở dữ liệu (MySQL)**: `localhost:3307` (Tài khoản: `root` / Mật khẩu: `123456`)

---

### ▶ Cách 2: Chạy thủ công từng phân hệ (Manual)

#### 1. Khởi tạo Cơ sở dữ liệu MySQL
Tạo một cơ sở dữ liệu mới tên là `shoes` và import file dữ liệu mẫu:
```sql
CREATE DATABASE shoes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Import dữ liệu mẫu từ terminal:
```bash
mysql -u root -p shoes < mysql_init/shoes_data.sql
```

#### 2. Khởi chạy Backend API
```bash
cd API_Shoes_Management
npm install
npm run dev
```

#### 3. Khởi chạy Frontend Web
```bash
cd WEB_Shoes_Management
npm install
npm run dev
```

---

## 🔑 Cấu hình các biến môi trường mẫu (`API_Shoes_Management/.env`)

```env
# Server Port
APP_PORT=3000

# Database Configuration (Chạy local chỉnh DB_PORT=3306 hoặc 3307 tùy cấu hình máy)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=shoes
DB_PORT=3307

# JWT Security Secrets
JWT_ACCESS_SECRET=your_new_jwt_access_secret_123456
JWT_REFRESH_SECRET=your_new_jwt_refresh_secret_123456
JWT_ACCESS_EXPIRE=1h
JWT_REFRESH_EXPIRE=14d

# Google OAuth Client ID (Frontend & Backend cùng sử dụng)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Google Gemini API Key (Tích hợp AI)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Config (Lưu trữ hình ảnh)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Brevo Config (SMTP Email gửi OTP)
BREVO_SMTP_USER=your_email@gmail.com
BREVO_API_KEY=your_brevo_api_key

# VNPay Sandbox Config
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_BACKEND_RETURN_URL=http://localhost:3000

# MoMo Sandbox Config
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_API_URL=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_BACKEND_RETURN_URL=http://localhost:3000

# CORS Allowed Origin
FRONTEND_URL=http://localhost:5173
```

---

## 🗂 Cấu trúc thư mục dự án

```text
Shoes-Ecommerce-Platform/
├── docker-compose.yml              # Quản lý khởi chạy Container
├── mysql_init/
│   └── shoes_data.sql              # File cấu trúc CSDL và dữ liệu mẫu
├── API_Shoes_Management/           # Dự án Backend (NodeJS / ExpressJS)
│   ├── src/
│   │   ├── config/                 # Cấu hình DB, Cors, biến môi trường
│   │   ├── controllers/            # Controller tiếp nhận request và trả response
│   │   ├── models/                 # Model trực tiếp truy vấn dữ liệu MySQL
│   │   ├── routes/                 # Khai báo các đường dẫn Endpoint
│   │   ├── middlewares/            # Middleware kiểm tra phân quyền, token
│   │   ├── services/               # Xử lý Business Logic nghiệp vụ
│   │   ├── providers/              # Tích hợp dịch vụ bên thứ 3 (Gemini, Mail, VNPay)
│   │   └── server.js               # Entry Point chính của Backend
│   └── Dockerfile
├── WEB_Shoes_Management/           # Dự án Frontend (ReactJS / Vite)
│   ├── src/
│   │   ├── pages/                  # Các trang giao diện phân chia theo Role
│   │   ├── components/             # Các component dùng chung
│   │   ├── redux/                  # Redux Toolkit quản lý State
│   │   ├── services/               # Service gọi API (Axios instance)
│   │   ├── layouts/                # Bố cục giao diện theo từng Role riêng biệt
│   │   └── App.jsx                 # Routing chính của ứng dụng client
│   └── Dockerfile
└── ShoesEcommerce_Postman_Collection.json # File import bộ test API Postman
```

---

## 📝 Bản quyền (License)

Dự án học thuật phục vụ cho mục đích học tập và làm đồ án công nghệ phần mềm mới. Mọi hành vi thương mại hóa đều cần liên hệ với tác giả.
