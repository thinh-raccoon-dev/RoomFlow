import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/invoice.dart';
import '../utils/formatters.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('RoomFlow'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Xin chào, ${user?.name ?? ''}!', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Phòng của bạn', style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 20),
            _LatestInvoiceCard(),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _NavCard(
                    icon: Icons.receipt_long,
                    label: 'Hóa đơn',
                    color: Colors.blue,
                    onTap: () => context.go('/invoices'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _NavCard(
                    icon: Icons.build,
                    label: 'Báo hỏng',
                    color: Colors.orange,
                    onTap: () => context.go('/maintenance'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _NavCard(
                    icon: Icons.person,
                    label: 'Hồ sơ',
                    color: Colors.green,
                    onTap: () => context.go('/profile'),
                  ),
                ),
                const Expanded(child: SizedBox()),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LatestInvoiceCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: apiService.getInvoices(
        month: DateTime.now().month,
        year: DateTime.now().year,
      ),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const LinearProgressIndicator();
        final invoices = snapshot.data!.map((j) => Invoice.fromJson(j as Map<String, dynamic>)).toList();
        if (invoices.isEmpty) {
          return const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Chưa có hóa đơn tháng này')));
        }
        final inv = invoices.first;
        final isPaid = inv.status == 'paid';
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('Hóa đơn Tháng ${inv.month}/${inv.year}',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isPaid ? Colors.green.shade100 : Colors.orange.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(isPaid ? 'Đã trả' : 'Chưa trả',
                        style: TextStyle(fontSize: 12, color: isPaid ? Colors.green.shade800 : Colors.orange.shade800)),
                  ),
                ]),
                const SizedBox(height: 12),
                _InvoiceLine('Tiền thuê', formatCurrency(inv.rentAmount)),
                _InvoiceLine('Tiền điện', formatCurrency(inv.electricityCost)),
                _InvoiceLine('Tiền nước', formatCurrency(inv.waterCost)),
                const Divider(height: 20),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Tổng cộng', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(formatCurrency(inv.totalAmount),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                ]),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _InvoiceLine extends StatelessWidget {
  final String label;
  final String value;
  const _InvoiceLine(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(color: Colors.grey.shade600)),
        Text(value),
      ]),
    );
  }
}

class _NavCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _NavCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          ]),
        ),
      ),
    );
  }
}
