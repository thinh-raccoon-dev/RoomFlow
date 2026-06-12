# RoomFlow — Memory

Ghi chú quan trọng tích lũy trong quá trình phát triển.

## Quyết định kiến trúc đã chốt

### 1. Pre-save hook cho tính tiền (không tính trong route handler)
Tiền điện/nước được tính trong `UtilityReading` pre-save hook, KHÔNG trong route handler.  
Lý do: đảm bảo tính nhất quán dù reading được tạo từ bất kỳ đâu (API, seed, migration).

### 2. Unique index trên (room, month, year)
Cả `UtilityReading` và `Invoice` đều có unique compound index trên `(room, month, year)`.  
Tránh tạo duplicate khi bấm nút nhiều lần.

### 3. JWT refresh trong interceptor, không phải component
Web: Axios interceptor tại `frontend_web/src/lib/api.ts` handle 401, không để từng component tự handle.  
Mobile: Dio interceptor tại `frontend_app/lib/services/api_service.dart`.

### 4. Tenant chỉ thấy invoice của mình
Route `GET /api/invoices` filter theo `tenant: req.user.userId` nếu role là `tenant`.  
Landlord thấy tất cả (không filter).

### 5. `10.0.2.2` cho Android emulator
Emulator Android không dùng `localhost` — phải dùng `10.0.2.2` để trỏ tới host machine.

### 6. Serialize `_id` → `id` toàn cục (plugin Mongoose)
Frontend (`@/types`) dùng field `id`, nhưng Mongoose mặc định serialize `_id`.
Plugin toàn cục tại `backend/src/config/mongoose.ts` set `toJSON` cho mọi schema: thêm `id` (string), bỏ `_id`, `__v`, `password`.
Phải import `./config/mongoose` **đầu tiên** trong `app.ts` (trước khi model compile) thì plugin mới áp dụng.
Chỉ route `auth` tự build object `{ id, ... }` nên không phụ thuộc plugin.

### 7. Dev chạy bằng `concurrently`, KHÔNG bằng Turbo
Turbo `run dev` làm `vite` thoát ngay (exit 1) trên Windows trong môi trường này.
Vì vậy script `dev` ở root dùng `concurrently` để chạy backend + web song song.
Turbo vẫn dùng cho `build`/`lint`/`clean`.

---

## Gotchas đã gặp

### MongoDB populate trong pre-save
`UtilityReading.pre('save')` cần populate `room.property` để lấy giá điện/nước.  
Dùng `this.populate('room')` rồi `Room.findById().populate('property')` — không thể chain populate trực tiếp trong pre-save.

### shadcn/ui cần cài từng component
shadcn/ui không cài bulk — phải chạy `npx shadcn-ui@latest add <component>` cho từng component cần dùng.  
Đã cài sẵn: button, card, input, select, table, badge, dialog.

### GoRouter redirect chạy trước screen build
`redirect` callback trong GoRouter đọc `ref.read(authProvider)` — nếu provider chưa init xong sẽ redirect sai.  
Fix: set `isLoading: true` trong `AuthState` init, GoRouter chỉ redirect khi `isLoading == false`.

---

## Seed data (đã có script: `npm run seed`)

Script `backend/src/seed.ts` **xoá sạch toàn bộ collection** rồi nạp lại bộ demo. Chạy: `npm run seed`.

Tài khoản (mật khẩu chung `password123`):
```
Landlord: landlord@roomflow.vn
Tenant:   tenant1@roomflow.vn (An), tenant2 (Bình), tenant3 (Cường), tenant4 (Dung)
```

Dữ liệu nạp sẵn:
- 2 khu trọ: "Khu trọ Bình Thạnh" (điện 3500, nước 15000) và "Khu trọ Thủ Đức" (điện 4000, nước 18000)
- 6 phòng (3 đang thuê qua hợp đồng active, 3 trống)
- Chỉ số điện/nước + hóa đơn cho 4 tháng gần nhất; hóa đơn tháng hiện tại có đủ 3 trạng thái paid/pending/overdue
- Thanh toán cho các hóa đơn đã trả; 3 yêu cầu sửa chữa (pending/in_progress/resolved)

Lưu ý: seed dùng `.create()` để kích hoạt pre-save hook (hash password, tính tiền điện/nước) — KHÔNG dùng `insertMany`.

---

## Dependencies đáng chú ý

### API
- `express-validator` — dùng cho input validation trên routes
- `multer` — xử lý file upload ảnh maintenance request
- `socket.io` — scaffolded, chưa implement push notification

### Web
- `@tanstack/react-query` v5 — breaking changes so với v4 (dùng `useQuery({ queryKey, queryFn })` không phải positional args)
- `recharts` — BarChart và LineChart cho reports page

### Mobile
- `riverpod_annotation` cần `build_runner` để generate code
- `intl` cần locale data init trong `main.dart` nếu dùng nhiều locale

---

## Đã hoàn thành gần đây

- [x] Tạo Landing Page tĩnh tại thư mục `docs/` (gồm `index.html`, `app.js`, `style.css` và assets ảnh) tích hợp máy tính điện nước tự động và popup hóa đơn demo.
- [x] Thêm script `dev:landing` để khởi chạy máy chủ tĩnh cho landing page tại cổng 8080.
- [x] Đồng bộ và chốt tông màu chính của dự án (Blue 500, Green 500, Amber 500, Red 500, Gray 50).
- [x] Trang quản lý hợp đồng trên web — `frontend_web/src/pages/ContractsPage.tsx` (route `/contracts`, nav trong Sidebar): danh sách, tạo hợp đồng (chọn phòng trống + khách thuê → phòng tự "occupied"), kết thúc hợp đồng (→ phòng "vacant")
- [x] Serialize `_id`→`id` toàn cục (xem mục Quyết định #6)
- [x] Seed script dữ liệu demo (`npm run seed`)

## Chưa implement (Phase 3)

- [ ] Push notifications (Socket.io web + FCM mobile)
- [ ] Export PDF hóa đơn
- [ ] Multi-landlord (currently 1 landlord/instance)
- [ ] SMS/Zalo webhook nhắc nợ
- [ ] Image upload trong NewMaintenanceScreen (roomId hiện để trống `''`)
