# RoomFlow — Project Context

## Vấn đề gốc

Bà chủ trọ quản lý **50+ phòng** trên nhiều cơ sở bằng giấy tờ thủ công:
- Ghi chỉ số điện/nước bằng tay, tính tiền thủ công trên máy tính bỏ túi
- Theo dõi ai đã đóng tiền, ai chưa bằng sổ tay
- Nhắc nhở thuê bao qua điện thoại
- Tốn **2–3 giờ mỗi ngày** chỉ để quản lý

## Giải pháp

Ứng dụng web + mobile thay thế toàn bộ quy trình thủ công.

### Core features (MVP)
| # | Tính năng | Người dùng |
|---|---|---|
| 1 | Dashboard tổng quan (tỉ lệ lấp đầy, doanh thu, thanh toán) | Bà chủ |
| 2 | Quản lý phòng & khách thuê | Bà chủ |
| 3 | Theo dõi thanh toán tháng, đánh dấu đã thu | Bà chủ |
| 4 | Tính tiền điện/nước tự động từ chỉ số | Bà chủ |

### Extended features
| # | Tính năng | Người dùng |
|---|---|---|
| 5 | Xem hóa đơn tháng, lịch sử thanh toán | Sinh viên |
| 6 | Gửi yêu cầu sửa chữa (báo hỏng) | Sinh viên |
| 7 | Báo cáo tài chính theo tháng/năm | Bà chủ |

## Business rules quan trọng

### Tính tiền điện/nước
```
electricityUsed  = currentReading - previousReading (kWh)
electricityCost  = electricityUsed × property.electricityPricePerKwh
waterUsed        = currentWater - previousWater (m³)
waterCost        = waterUsed × property.waterPricePerM3
```
Mặc định: điện = 3.500 ₫/kWh, nước = 15.000 ₫/m³  
Logic này nằm trong **pre-save hook** của `UtilityReading` model.

### Invoice tổng
```
totalAmount = rentAmount + electricityCost + waterCost + otherFees
```
Trạng thái invoice: `pending` → `paid` (khi bà chủ đánh dấu) hoặc `overdue` (quá hạn)

### Contract lifecycle
```
pending → active (khi tenant vào phòng) → ended (khi hết hạn/chấm dứt)
```
Phòng chỉ được tạo invoice khi có contract `active`.

### Vai trò người dùng
- `landlord`: toàn quyền (CRUD mọi thứ, xem tất cả invoice)
- `tenant`: chỉ xem invoice/contract của chính mình, gửi maintenance request

## Tech stack decisions

| Quyết định | Lý do |
|---|---|
| MongoDB thay SQL | Schema linh hoạt, phù hợp rapid MVP |
| npm workspaces + Turborepo | 1 lệnh chạy cả backend + web (frontend_web), cache build |
| Zustand (không Redux) | Đủ đơn giản cho auth state, persist built-in |
| TanStack Query | Cache server state, auto-refetch, invalidate |
| Riverpod (không Provider/Bloc) | Code-gen friendly, không cần BuildContext |
| GoRouter | Redirect guards bằng `redirect` callback đơn giản |
| flutter_secure_storage | Lưu JWT an toàn hơn SharedPreferences |

## Môi trường

| Service | Thư mục | URL Dev |
|---|---|---|
| Backend API | `backend/` | http://localhost:3001 |
| Web dashboard | `frontend_web/` | http://localhost:5173 |
| Mobile → API (Android) | `frontend_app/` | http://10.0.2.2:3001/api |
| MongoDB | — | mongodb://localhost:27017/roomflow |

## Phases

- **Phase 1** ✅ — Backend API + Web Dashboard MVP
- **Phase 2** ✅ — Flutter Mobile App
- **Phase 3** (tương lai) — Push notifications, Export PDF, Multi-landlord, SMS/Zalo webhook
