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

## Seed data gợi ý (cho dev/test)

```
Landlord: landlord@roomflow.vn / password123
Tenant:   tenant1@roomflow.vn / password123

Property: "Khu trọ Bình Thạnh" — electricityPricePerKwh: 3500, waterPricePerM3: 15000
Rooms: P101, P102, P103 (baseRent: 3.500.000 ₫)
Contract: tenant1 ở P101, từ 01/01/2025
```

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

## Chưa implement (Phase 3)

- [ ] Push notifications (Socket.io web + FCM mobile)
- [ ] Export PDF hóa đơn
- [ ] Multi-landlord (currently 1 landlord/instance)
- [ ] SMS/Zalo webhook nhắc nợ
- [ ] Trang quản lý hợp đồng trên web (contracts CRUD page)
- [ ] Image upload trong NewMaintenanceScreen (roomId hiện để trống `''`)
