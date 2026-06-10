# RoomFlow — CLAUDE.md

Hướng dẫn cho AI assistant làm việc trong dự án này.

## Dự án là gì

RoomFlow là hệ thống quản lý khu trọ cho bà chủ có 50+ phòng trên nhiều cơ sở.  
Thay thế hoàn toàn quy trình thủ công bằng giấy tờ (hiện tốn 2-3 giờ/ngày).

Hai nhóm người dùng:
- **Bà chủ** → dùng web dashboard (`frontend_web`)
- **Sinh viên** → dùng mobile app (`frontend_app`)

## Cấu trúc dự án

```
RoomFlow/
├── backend/        Node.js + Express + TypeScript + Mongoose (API)
├── frontend_web/   React 18 + Vite + TypeScript + Tailwind CSS (dashboard bà chủ)
├── frontend_app/   Flutter + Dart (app sinh viên)
├── turbo.json
└── package.json    (npm workspaces: backend + frontend_web)
```

- `backend` và `frontend_web` là npm workspaces, được Turborepo điều phối → `npm run dev` chạy cả hai cùng lúc.
- `frontend_app` (Flutter) **không** nằm trong npm workspaces, chạy riêng bằng Flutter SDK.

## Ngôn ngữ UI

Toàn bộ UI dùng **tiếng Việt** (labels, messages, placeholders, snackbars).  
Code, variable names, comments viết bằng **tiếng Anh**.

## Quy ước code

### Backend (backend)
- Framework: Express + TypeScript, ODM: Mongoose
- Auth: JWT access token (15m) + refresh token (7d), bcrypt cho password
- Middleware bắt buộc: `authenticate` trước mọi protected route, `requireLandlord` cho route chỉ bà chủ dùng
- Business logic tính tiền điện/nước nằm trong Mongoose **pre-save hook** của `UtilityReading` model
- Mọi route handler trả về `{ success, data }` hoặc `{ success, message, error }`

### Web (frontend_web)
- State management: **Zustand** (auth, persist vào localStorage) + **TanStack Query** (server state)
- HTTP: Axios instance tại `src/lib/api.ts`, có auto-refresh JWT khi 401
- Component lib: **shadcn/ui** + **lucide-react** icons
- Charts: **Recharts**
- Route guard: `<ProtectedRoute>` component bao ngoài mọi route cần auth
- TypeScript types dùng chung tại `src/types/index.ts` (import qua alias `@/types`)

### Mobile (frontend_app)
- State: **Riverpod** (flutter_riverpod)
- Navigation: **GoRouter** với redirect guard dựa vào `authProvider`
- HTTP: **Dio** với interceptor tự refresh token, lưu token trong **flutter_secure_storage**
- Base URL dev: `http://10.0.2.2:3001/api` (Android emulator → host localhost)
- Tiền tệ: dùng `formatCurrency()` từ `lib/utils/formatters.dart` (vi_VN, ₫)

## Shared types

Web giữ data shapes tại `frontend_web/src/types/index.ts`, import qua alias `@/types`.  
Backend định nghĩa interface riêng trong từng model (`backend/src/models/*.model.ts`).  
Khi đổi shape của một resource → cập nhật **cả hai** nơi cho khớp (model backend ↔ types web).

## Lệnh hay dùng

```bash
# Dev (backend + web song song)
npm run dev

# Chỉ backend
npm run dev:backend     # hoặc: cd backend && npm run dev

# Chỉ web
npm run dev:web         # hoặc: cd frontend_web && npm run dev

# Mobile
cd frontend_app && flutter pub get && flutter run
```

## Không làm những điều này

- Không commit file `backend/.env` (chứa secrets)
- Không tạo page/component mới khi chỉ cần sửa component đã có
- Không đổi shape resource ở backend model mà quên cập nhật `frontend_web/src/types/index.ts`
- Không hard-code giá điện/nước — đọc từ `property.electricityPricePerKwh` và `property.waterPricePerM3`
- Không thêm `frontend_app` vào npm workspaces (đây là project Flutter)
