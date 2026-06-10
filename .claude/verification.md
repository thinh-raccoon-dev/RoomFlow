# RoomFlow — Verification Checklist

Danh sách kiểm tra trước khi coi một tính năng là done.

---

## Setup lần đầu

```bash
# 1. Copy env
cp .env.example backend/.env
# Chỉnh MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET trong backend/.env

# 2. Cài dependencies (backend + frontend_web qua npm workspaces)
npm install

# 3. Flutter deps
cd frontend_app && flutter pub get && cd ..
```

---

## Chạy dev

```bash
npm run dev
# → API: http://localhost:3001
# → Web: http://localhost:5173
```

---

## Backend API — test thủ công

Dùng Thunder Client hoặc curl theo thứ tự:

### Auth flow
```
POST /api/auth/register
  body: { name, email, password, role: "landlord" }
  ✓ trả về { user, accessToken, refreshToken }

POST /api/auth/login
  body: { email, password }
  ✓ trả về { user, accessToken, refreshToken }

POST /api/auth/refresh
  body: { refreshToken }
  ✓ trả về accessToken mới
```

### Core data flow
```
POST /api/properties          (cần Bearer token landlord)
  ✓ tạo property, trả về _id

POST /api/rooms               (cần propertyId từ bước trên)
  ✓ tạo room với status: "vacant"

POST /api/auth/register       (tạo tenant account)
  body: { role: "tenant" }

POST /api/contracts
  ✓ gắn tenant vào room, room.status → "occupied"

POST /api/utility-readings
  ✓ nhập chỉ số điện/nước
  ✓ response chứa electricityCost và waterCost đã tính

POST /api/invoices/generate
  body: { roomId, month, year }
  ✓ totalAmount = rentAmount + electricityCost + waterCost

POST /api/payments
  body: { invoiceId, amount, method }
  ✓ invoice.status → "paid"
```

### Dashboard
```
GET /api/reports/dashboard
  ✓ occupancyRate, totalRevenue, pendingPayments, overduePayments
  ✓ propertyStats là array theo từng property
```

---

## Web Dashboard — kiểm tra browser

### Login
- [ ] `/login` form hoạt động, redirect về `/` sau đăng nhập
- [ ] Sai password hiện error message
- [ ] Refresh page vẫn giữ login (Zustand persist)

### Dashboard (`/`)
- [ ] 4 stat cards hiện số thực từ API
- [ ] BarChart hiện doanh thu 12 tháng
- [ ] Property occupancy progress bars

### Payments (`/payments`)
- [ ] Filter tháng/năm hoạt động
- [ ] Nút "Đánh dấu đã thu" → invoice status đổi ngay (no page reload)
- [ ] 3 summary cards (paid/pending/overdue) cập nhật sau khi mark paid

### Utilities (`/utilities`)
- [ ] Nhập chỉ số điện/nước → hiện cost tính toán
- [ ] Nút "Tạo HĐ" → tạo invoice, redirect/notify thành công

### Reports (`/reports`)
- [ ] BarChart + LineChart render đúng
- [ ] Filter năm hoạt động

---

## Mobile App — kiểm tra trên emulator/device

### Login
- [ ] Form đăng nhập với tenant account
- [ ] Sai credentials → thông báo lỗi tiếng Việt
- [ ] Đăng nhập thành công → HomeScreen

### HomeScreen
- [ ] Hiện hóa đơn mới nhất với số tiền format ₫ đúng
- [ ] 3 nav card (Hóa đơn, Báo hỏng, Hồ sơ)

### InvoiceListScreen
- [ ] Danh sách hóa đơn của tenant đó (không thấy của tenant khác)
- [ ] Bấm vào → InvoiceDetailScreen

### InvoiceDetailScreen
- [ ] Hiện: tiền thuê, điện, nước, tổng cộng
- [ ] Status badge hiện màu đúng (pending/paid/overdue)

### MaintenanceListScreen
- [ ] Danh sách requests của tenant
- [ ] FAB "Báo hỏng mới" → NewMaintenanceScreen

### NewMaintenanceScreen
- [ ] Nhập tiêu đề + mô tả + priority
- [ ] Submit → SnackBar "Đã gửi thành công" → back về list
- [ ] Validate: không submit nếu title/description trống

### ProfileScreen
- [ ] Hiện tên, email, phone
- [ ] Nút đăng xuất hoạt động, quay về LoginScreen

---

## E2E flow hoàn chỉnh

```
1. Đăng nhập bà chủ (web)
2. Tạo property mới
3. Thêm 2 phòng (P101, P102)
4. Tạo tài khoản sinh viên
5. Tạo contract: sinh viên → P101
6. Nhập chỉ số điện/nước tháng hiện tại cho P101
7. Tạo hóa đơn tháng cho P101
8. Đăng nhập sinh viên (mobile) → thấy hóa đơn
9. Sinh viên gửi báo hỏng từ mobile
10. Bà chủ đánh dấu thanh toán (web) → invoice status = paid
11. Sinh viên refresh → invoice hiện "Đã thanh toán"
```

---

## Checklist trước khi push code

- [ ] `npm run build` không có TypeScript errors
- [ ] `flutter analyze` không có warnings
- [ ] Không có console.log/print debug còn sót
- [ ] Không commit `backend/.env`
- [ ] Shape resource ở `backend` model đồng bộ với `frontend_web/src/types/index.ts`
