# RoomFlow — Agents Guide

Hướng dẫn sử dụng AI agents hiệu quả trong dự án này.

## Khi nào dùng agent nào

### Explore agent
Dùng khi cần tìm file hoặc symbol mà không chắc vị trí:
```
"Tìm tất cả chỗ dùng Invoice model"
"File nào define formatCurrency?"
"Grep tất cả route có authenticate middleware"
```

### Plan agent
Dùng trước khi implement tính năng mới phức tạp:
```
"Lên plan thêm tính năng export PDF hóa đơn"
"Design schema cho tính năng multi-landlord"
```

### General-purpose agent
Dùng cho task đa bước, ví dụ:
```
"Refactor tất cả API calls trong mobile sang dùng Riverpod AsyncNotifier"
"Thêm validation cho tất cả form screens"
```

## Context cần cung cấp khi spawn agent

Luôn include:
1. **App layer** đang làm việc (api / web / mobile)
2. **File paths** liên quan nếu biết
3. **Business rule** ảnh hưởng (ví dụ: "chỉ tenant mới được xem invoice của mình")

## Patterns đặc thù của dự án

### Thêm API endpoint mới
1. Tạo route file tại `backend/src/routes/`
2. Register trong `backend/src/app.ts`
3. Cập nhật shape tương ứng trong `frontend_web/src/types/index.ts`
4. Thêm API call vào `frontend_web/src/lib/api.ts` hoặc `frontend_app/lib/services/api_service.dart`

### Thêm trang web mới
1. Tạo page tại `frontend_web/src/pages/`
2. Thêm route vào `frontend_web/src/App.tsx`
3. Thêm nav item vào `frontend_web/src/components/layout/Sidebar.tsx`

### Thêm màn hình mobile mới
1. Tạo screen tại `frontend_app/lib/screens/`
2. Thêm route vào `frontend_app/lib/router/app_router.dart`
3. Nếu cần state mới → tạo provider tại `frontend_app/lib/providers/`

### Thêm Mongoose model mới
1. Tạo model tại `backend/src/models/`
2. Cập nhật interface tương ứng trong `frontend_web/src/types/index.ts`
3. Export từ model index nếu có
4. Tạo route CRUD tương ứng

## File quan trọng nhất cần biết

| File | Vai trò |
|---|---|
| `backend/src/app.ts` | Đăng ký tất cả routes (import `./config/mongoose` đầu tiên) |
| `backend/src/config/mongoose.ts` | Plugin toàn cục serialize `_id`→`id`, strip `__v`/`password` |
| `backend/src/middleware/auth.middleware.ts` | JWT guard, role check |
| `backend/src/models/UtilityReading.model.ts` | Business logic tính điện/nước |
| `backend/src/seed.ts` | Seed dữ liệu demo (`npm run seed`) |
| `frontend_web/src/types/index.ts` | Data shapes dùng chung cho web |
| `frontend_web/src/lib/api.ts` | Axios instance + JWT refresh |
| `frontend_web/src/stores/auth.store.ts` | Auth state (Zustand) |
| `frontend_web/src/App.tsx` | Route definitions + ProtectedRoute |
| `frontend_web/src/pages/ContractsPage.tsx` | Quản lý hợp đồng (gắn khách vào phòng) |
| `frontend_app/lib/services/api_service.dart` | Dio instance + token refresh |
| `frontend_app/lib/providers/auth_provider.dart` | Auth state (Riverpod) |
| `frontend_app/lib/router/app_router.dart` | GoRouter + redirect logic |

## Lưu ý khi làm việc với context dài

- Dự án có 3 layer ở thư mục gốc: `backend`, `frontend_web`, `frontend_app`. Khi hỏi, xác định rõ đang làm layer nào.
- Đổi shape resource ở `backend` model cần đồng bộ `frontend_web/src/types/index.ts`.
- Tính tiền không bao giờ hard-code — luôn đọc từ `property` document.
