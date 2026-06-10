import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String _baseUrl = 'http://10.0.2.2:3001/api';
  static const _storage = FlutterSecureStorage();

  late final Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(baseUrl: _baseUrl));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await _storage.read(key: 'refresh_token');
          if (refreshToken != null) {
            try {
              final res = await Dio().post('$_baseUrl/auth/refresh', data: {'refreshToken': refreshToken});
              final newToken = res.data['accessToken'] as String;
              await _storage.write(key: 'access_token', value: newToken);
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              return handler.resolve(await _dio.fetch(error.requestOptions));
            } catch (_) {
              await _storage.deleteAll();
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    await _storage.write(key: 'access_token', value: res.data['accessToken']);
    await _storage.write(key: 'refresh_token', value: res.data['refreshToken']);
    return res.data as Map<String, dynamic>;
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }

  Future<List<dynamic>> getInvoices({int? month, int? year}) async {
    final params = <String, dynamic>{};
    if (month != null) params['month'] = month;
    if (year != null) params['year'] = year;
    final res = await _dio.get('/invoices', queryParameters: params);
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getInvoice(String id) async {
    final res = await _dio.get('/invoices/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getMaintenanceRequests() async {
    final res = await _dio.get('/maintenance');
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> createMaintenanceRequest({
    required String roomId,
    required String title,
    required String description,
    required String priority,
  }) async {
    final res = await _dio.post('/maintenance', data: {
      'room': roomId,
      'title': title,
      'description': description,
      'priority': priority,
    });
    return res.data as Map<String, dynamic>;
  }
}

final apiService = ApiService();
