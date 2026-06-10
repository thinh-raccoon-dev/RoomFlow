# RoomFlow — Hệ thống quản lý khu trọ

Ứng dụng quản lý toàn diện cho bà chủ trọ (web) và sinh viên (mobile).

## Cấu trúc dự án

```
RoomFlow/
├── backend/        Node.js + Express + MongoDB (API)        → http://localhost:3001
├── frontend_web/   React + Vite + Tailwind (dashboard)      → http://localhost:5173
├── frontend_app/   Flutter (app sinh viên)
├── turbo.json
└── package.json    (npm workspaces: backend + frontend_web)
```

`backend` và `frontend_web` là npm workspaces, chạy cùng lúc từ thư mục gốc. `frontend_app` (Flutter) chạy riêng bằng Flutter SDK.

---

## Yêu cầu môi trường

- **Node.js** 18 trở lên
- **MongoDB** (local hoặc Atlas) — mặc định dùng `mongodb://localhost:27017/roomflow`
- **Flutter SDK** 3.x (chỉ cần nếu chạy app mobile)

---

## Khởi động nhanh (web + API)

```bash
# 1. Cài dependencies (cho cả backend + frontend_web)
npm install

# 2. Tạo file .env cho backend từ mẫu
cp .env.example backend/.env
#    Windows (PowerShell): copy .env.example backend\.env

# 3. Đảm bảo MongoDB đang chạy (xem mục bên dưới)

# 4. Nạp dữ liệu demo (tài khoản, khu trọ, hóa đơn... )
npm run seed

# 5. Chạy backend + web cùng lúc
npm run dev
```

Sau khi chạy:
- **Web dashboard:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## Tài khoản demo

Sau khi chạy `npm run seed`, dùng các tài khoản sau (mật khẩu chung: `password123`):

| Vai trò | Email | Dùng ở |
|---|---|---|
| Bà chủ | `landlord@roomflow.vn` | Web dashboard |
| Sinh viên | `tenant1@roomflow.vn` | App mobile |
| Sinh viên | `tenant2@roomflow.vn` | App mobile |
| Sinh viên | `tenant3@roomflow.vn` | App mobile |
| Sinh viên | `tenant4@roomflow.vn` | App mobile |

> Đăng nhập web **phải** dùng tài khoản bà chủ (`landlord`).

---

## Các lệnh thường dùng

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy backend + web song song |
| `npm run dev:backend` | Chỉ chạy backend API |
| `npm run dev:web` | Chỉ chạy web dashboard |
| `npm run seed` | Nạp lại dữ liệu demo (xoá sạch dữ liệu cũ rồi nạp mới) |
| `npm run build` | Build cả backend + web (qua Turborepo) |
| `npm run lint` | Lint cả backend + web |

> `npm run seed` là alias cho `npm run seed --workspace @roomflow/backend`.

---

## MongoDB

Ứng dụng cần một MongoDB đang chạy. Chọn 1 trong các cách:

- **Local (cài sẵn):** khởi động dịch vụ `mongod`, dùng URI mặc định `mongodb://localhost:27017/roomflow`.
- **Docker:**
  ```bash
  docker run -d --name roomflow-mongo -p 27017:27017 mongo:7
  ```
- **MongoDB Atlas (cloud):** sửa `MONGODB_URI` trong `backend/.env` thành connection string của Atlas.

---

## Cấu hình `backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017/roomflow
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

> File `.env` chứa secrets, **không commit** lên git.

---

## Chạy app mobile (Flutter)

```bash
cd frontend_app
flutter pub get
flutter run
```

- Android emulator gọi API qua `http://10.0.2.2:3001/api` (đã cấu hình sẵn).
- Đăng nhập bằng tài khoản sinh viên ở bảng trên.

---

## Quy trình demo gợi ý (trên web)

1. Đăng nhập bà chủ → xem **Tổng quan** (tỉ lệ lấp đầy, doanh thu, thanh toán).
2. **Khu trọ** → xem 2 khu trọ và các phòng.
3. **Hợp đồng** → gắn khách thuê vào phòng trống (phòng tự chuyển sang "đang thuê").
4. **Điện / Nước** → nhập chỉ số → hệ thống tự tính tiền → bấm **Tạo HĐ**.
5. **Thanh toán** → đánh dấu hóa đơn đã thu.
6. **Báo cáo** → xem biểu đồ doanh thu theo tháng.

---

## Xử lý lỗi thường gặp

- **`EADDRINUSE: port 3001 (hoặc 5173) already in use`** — đã có tiến trình cũ giữ cổng. Tắt tiến trình Node cũ rồi chạy lại:
  ```bash
  # Windows
  taskkill /F /IM node.exe
  # macOS/Linux
  pkill -f node
  ```
  Chỉ chạy **một** `npm run dev` tại một thời điểm.
- **Backend báo lỗi kết nối MongoDB** — kiểm tra MongoDB đã chạy và `MONGODB_URI` trong `backend/.env` đúng.
- **Web trắng trang** — thử mở thẳng http://localhost:5173/login và làm mới bằng `Ctrl + F5`.

---

## API Endpoints chính

| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới access token |
| GET | `/api/properties` | Danh sách khu trọ |
| GET | `/api/rooms` | Danh sách phòng |
| GET/POST | `/api/contracts` | Hợp đồng (gắn khách vào phòng) |
| GET | `/api/utility-readings` | Chỉ số điện/nước |
| GET | `/api/invoices` | Hóa đơn |
| POST | `/api/invoices/generate` | Tạo hóa đơn tháng |
| POST | `/api/payments` | Đánh dấu thanh toán |
| GET | `/api/reports/dashboard` | Thống kê tổng quan |
| GET | `/api/maintenance` | Yêu cầu sửa chữa |

---

## Tính năng

### Bà chủ (Web)
- Dashboard: tỉ lệ lấp đầy, doanh thu, thanh toán
- Quản lý khu trọ & phòng
- Quản lý khách thuê & hợp đồng
- Theo dõi thanh toán tháng
- Nhập chỉ số điện/nước → tự tính tiền
- Quản lý yêu cầu sửa chữa
- Báo cáo doanh thu

### Sinh viên (Mobile)
- Xem hóa đơn tháng (tiền thuê + điện + nước)
- Lịch sử thanh toán
- Gửi yêu cầu sửa chữa
- Xem hồ sơ hợp đồng
