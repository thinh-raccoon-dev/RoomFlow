import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';
import '../models/invoice.dart';
import '../utils/formatters.dart';

class InvoiceListScreen extends StatelessWidget {
  const InvoiceListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử hóa đơn')),
      body: FutureBuilder<List<dynamic>>(
        future: apiService.getInvoices(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('Chưa có hóa đơn nào'));
          }
          final invoices = snapshot.data!.map((j) => Invoice.fromJson(j as Map<String, dynamic>)).toList();
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: invoices.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) {
              final inv = invoices[i];
              final isPaid = inv.status == 'paid';
              return Card(
                child: ListTile(
                  onTap: () => context.go('/invoices/${inv.id}'),
                  leading: CircleAvatar(
                    backgroundColor: isPaid ? Colors.green.shade100 : Colors.orange.shade100,
                    child: Icon(
                      isPaid ? Icons.check : Icons.schedule,
                      color: isPaid ? Colors.green.shade700 : Colors.orange.shade700,
                    ),
                  ),
                  title: Text('Tháng ${inv.month}/${inv.year}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Phòng ${inv.roomNumber}'),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(formatCurrency(inv.totalAmount), style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(isPaid ? 'Đã trả' : 'Chưa trả',
                          style: TextStyle(fontSize: 12, color: isPaid ? Colors.green : Colors.orange)),
                    ],
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
