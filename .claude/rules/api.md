# Rules — Backend API (backend)

## Bắt buộc

- Mọi protected route PHẢI có `authenticate` middleware
- Route chỉ dành cho bà chủ PHẢI có `requireLandlord` middleware
- Thành công: trả thẳng JSON tài nguyên (vd `res.json(invoice)` hoặc mảng), status 201 cho create
- Lỗi: trả `res.status(code).json({ message, error? })` với code phù hợp (400/401/403/404/409/500)
- Dùng `express-validator` cho input validation, không tự validate thủ công
- Password KHÔNG BAO GIỜ được trả về (plugin toàn cục đã strip `password`; thêm `.select('-password')` cho chắc)

## Serialization

- Plugin toàn cục tại `config/mongoose.ts` set `toJSON` cho MỌI schema: thêm `id` (string), bỏ `_id`, `__v`, `password`
- Vì vậy response luôn có `id` — KHÔNG dựa vào `_id` ở client
- Plugin PHẢI được import (`import './config/mongoose'`) trước khi bất kỳ model nào compile → để dòng đầu `app.ts`

## Model conventions

- Mọi model PHẢI có `timestamps: true` trong schema options
- Unique constraint dùng compound index, không chỉ field-level unique
- Giá tiền lưu dưới dạng số nguyên **VND** (không float, không USD)
- Reference dùng `mongoose.Types.ObjectId` với `ref: 'ModelName'`
- Seed/migration dùng `.create()` (không `insertMany`) để chạy pre-save hook (hash password, tính tiền)

## Tính tiền

- Tính tiền điện/nước CHỈ trong pre-save hook của `UtilityReading`
- Giá điện/nước đọc từ `property.electricityPricePerKwh` và `property.waterPricePerM3`
- KHÔNG hard-code giá tiền bất cứ đâu ngoài default value trong Property schema

## Error handling

```typescript
// Pattern chuẩn
try {
  const data = await SomeModel.find(...);
  res.json({ success: true, data });
} catch (error) {
  res.status(500).json({ success: false, message: 'Lỗi server', error });
}
```

## File structure

```
src/
├── config/      database.ts, jwt.ts, mongoose.ts (plugin toàn cục)
├── middleware/  auth.middleware.ts
├── models/      *.model.ts
├── routes/      *.routes.ts
├── seed.ts      dữ liệu demo (npm run seed)
├── app.ts       import './config/mongoose' đầu tiên, rồi register routes
└── index.ts     HTTP server + Socket.io
```
