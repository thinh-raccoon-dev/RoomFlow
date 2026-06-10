import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';
import '../models/maintenance_request.dart';
import '../utils/formatters.dart';

class MaintenanceListScreen extends StatelessWidget {
  const MaintenanceListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Báo hỏng')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/maintenance/new'),
        icon: const Icon(Icons.add),
        label: const Text('Báo hỏng mới'),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: apiService.getMaintenanceRequests(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('Chưa có yêu cầu nào'));
          }
          final requests = snapshot.data!.map((j) => MaintenanceRequest.fromJson(j as Map<String, dynamic>)).toList();
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: requests.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) {
              final req = requests[i];
              final statusColors = {
                'pending': Colors.yellow.shade700,
                'in_progress': Colors.blue.shade700,
                'resolved': Colors.green.shade700,
                'cancelled': Colors.grey.shade600,
              };
              final statusLabels = {
                'pending': 'Chờ xử lý',
                'in_progress': 'Đang xử lý',
                'resolved': 'Đã xong',
                'cancelled': 'Hủy',
              };
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.build, color: Colors.orange),
                  title: Text(req.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('Phòng ${req.roomNumber} · ${formatDate(req.createdAt)}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: (statusColors[req.status] ?? Colors.grey).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(statusLabels[req.status] ?? req.status,
                        style: TextStyle(fontSize: 12, color: statusColors[req.status] ?? Colors.grey)),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
