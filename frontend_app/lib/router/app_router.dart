import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';
import '../screens/home_screen.dart';
import '../screens/invoice_list_screen.dart';
import '../screens/invoice_detail_screen.dart';
import '../screens/maintenance_list_screen.dart';
import '../screens/new_maintenance_screen.dart';
import '../screens/profile_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.user != null;
      final isLoginPage = state.matchedLocation == '/login';
      if (!isLoggedIn && !isLoginPage) return '/login';
      if (isLoggedIn && isLoginPage) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(
        path: '/',
        builder: (_, __) => const HomeScreen(),
        routes: [
          GoRoute(path: 'invoices', builder: (_, __) => const InvoiceListScreen()),
          GoRoute(
            path: 'invoices/:id',
            builder: (_, state) => InvoiceDetailScreen(invoiceId: state.pathParameters['id']!),
          ),
          GoRoute(path: 'maintenance', builder: (_, __) => const MaintenanceListScreen()),
          GoRoute(path: 'maintenance/new', builder: (_, __) => const NewMaintenanceScreen()),
          GoRoute(path: 'profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),
    ],
  );
});
