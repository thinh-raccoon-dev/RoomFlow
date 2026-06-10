# Rules — Backend API (backend)

## Bắt buộc

- Mọi protected route PHẢI có `authenticate` middleware
- Route chỉ dành cho bà chủ PHẢI có `requireLandlord` middleware
- Route handler PHẢI trả về `{ success: true, data }` khi thành công
- Route handler PHẢI trả về `{ success: false, message, error? }` khi lỗi
- Dùng `express-validator` cho input validation, không tự validate thủ công
- Password KHÔNG BAO GIỜ được trả về trong response (dùng `.select('-password')`)

## Model conventions

- Mọi model PHẢI có `timestamps: true` trong schema options
- Unique constraint dùng compound index, không chỉ field-level unique
- Giá tiền lưu dưới dạng số nguyên **VND** (không float, không USD)
- Reference dùng `mongoose.Types.ObjectId` với `ref: 'ModelName'`

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
├── config/      database.ts, jwt.ts
├── middleware/  auth.middleware.ts
├── models/      *.model.ts
├── routes/      *.routes.ts
├── app.ts       register routes
└── index.ts     HTTP server + Socket.io
```
