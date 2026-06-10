# Rules — Mobile App (frontend_app)

## State management (Riverpod)

- Auth state dùng `StateNotifier<AuthState>` tại `lib/providers/auth_provider.dart`
- Dùng `ConsumerWidget` hoặc `ConsumerStatefulWidget` khi cần đọc provider
- `ref.watch()` cho reactive data (rebuild khi thay đổi)
- `ref.read()` cho one-time actions (trong event handlers)
- KHÔNG dùng `Provider` legacy hay `setState` cho shared state

## Navigation (GoRouter)

- Định nghĩa routes trong `lib/router/app_router.dart`
- Dùng `context.go()` cho navigation thay thế (không thể back)
- Dùng `context.push()` cho navigation có back button
- Auth redirect xử lý trong `redirect` callback của GoRouter

## HTTP (Dio)

- Mọi API call qua `apiService` singleton tại `lib/services/api_service.dart`
- Token tự refresh trong Dio interceptor — screen không xử lý 401
- Base URL dev: `http://10.0.2.2:3001/api` (Android emulator)
- KHÔNG hard-code URL trong screen — luôn qua `apiService`

## UI conventions

- Loading: `CircularProgressIndicator()` ở center
- Error: `SnackBar` với message tiếng Việt
- Empty state: `Center(child: Text('Chưa có ...'))`
- Tiền: dùng `formatCurrency()` từ `lib/utils/formatters.dart`
- Ngày: dùng `formatDate()` từ `lib/utils/formatters.dart`

## Models (Dart)

- Mỗi model có `fromJson(Map<String, dynamic>)` factory constructor
- Dùng `final` cho tất cả fields
- Tên file: `snake_case.dart`, tên class: `PascalCase`

## File structure

```
lib/
├── main.dart
├── router/
│   └── app_router.dart
├── models/          Dart data classes
├── providers/       Riverpod StateNotifiers
├── screens/         UI screens
├── services/
│   └── api_service.dart
└── utils/
    └── formatters.dart
```

## Platform notes

- Android emulator: dùng `10.0.2.2` thay `localhost`
- iOS simulator: dùng `localhost` bình thường
- Token lưu trong `flutter_secure_storage` (không SharedPreferences)
