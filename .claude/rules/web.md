# Rules — Web Dashboard (frontend_web)

## Auth & routing

- Mọi page cần auth PHẢI được bao bởi `<ProtectedRoute>` trong `App.tsx`
- Redirect về `/login` khi không có user trong Zustand store
- KHÔNG lưu token vào component state — chỉ dùng `useAuthStore()`

## Data fetching

- Dùng **TanStack Query** cho mọi server data (danh sách, chi tiết)
- Query key convention: `['resource', id?]` — ví dụ: `['invoices', month, year]`
- Sau mutation (tạo/sửa/xóa) PHẢI gọi `queryClient.invalidateQueries` để refetch
- KHÔNG fetch dữ liệu trong `useEffect` — dùng `useQuery` hoặc `useMutation`

## Component conventions

- Dùng **shadcn/ui** components làm base, custom bằng className
- Icons từ **lucide-react** (không dùng icon library khác)
- Loading state: `<div className="animate-spin">` hoặc skeleton từ shadcn
- Error state: hiện message lỗi từ API response

## Styles

- Tailwind utility classes, KHÔNG viết custom CSS ngoại trừ `index.css`
- Tông màu chính của dự án:
  - Header/Navigation & Buttons (Primary): Blue 500 (`#3B82F6`)
  - Success/Occupied: Green 500 (`#10B981`)
  - Warning/Pending: Amber 500 (`#F59E0B`)
  - Error/Overdue: Red 500 (`#EF4444`)
  - Background: Gray 50 (`#F9FAFB`)
- Tiền tệ hiển thị: `toLocaleString('vi-VN') + ' ₫'` hoặc dùng `Intl.NumberFormat`

## API calls

- Mọi HTTP call qua Axios instance tại `src/lib/api.ts` (không dùng fetch trực tiếp)
- Token refresh xử lý tự động trong interceptor — component không cần xử lý 401

## Form handling

- Dùng controlled components với `useState` cho form đơn giản
- Nếu form phức tạp (nhiều field, validation) → dùng `react-hook-form` + `zod`

## File structure

```
src/
├── components/
│   ├── layout/    Sidebar.tsx, Header.tsx
│   └── ui/        shadcn components (auto-generated)
├── lib/
│   └── api.ts     Axios instance
├── pages/         1 file = 1 route
├── stores/
│   └── auth.store.ts
├── types/
│   └── index.ts   Shared data shapes (import qua alias @/types)
└── App.tsx        Routes + ProtectedRoute
```

## Types

- Data shapes (User, Invoice, Room...) khai báo tại `src/types/index.ts`, import bằng `@/types`
- KHÔNG dùng package workspace `@roomflow/types` nữa (đã inline vào web)
