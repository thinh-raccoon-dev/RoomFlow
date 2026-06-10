import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/invoice.dart';
import '../utils/formatters.dart';

class InvoiceDetailScreen extends StatelessWidget {
  final String invoiceId;
  const InvoiceDetailScreen({super.key, required this.invoiceId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết hóa đơn')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: apiService.getInvoice(invoiceId),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final inv = Invoice.fromJson(snapshot.data!);
          final isPaid = inv.status == 'paid';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Text('Tháng ${inv.month}/${inv.year}',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: isPaid ? Colors.green.shade100 : Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
                                style: TextStyle(color: isPaid ? Colors.green.shade800 : Colors.orange.shade800, fontWeight: FontWeight.w600)),
                          ),
                        ]),
                        const SizedBox(height: 8),
                        Text('Phòng ${inv.roomNumber}', style: TextStyle(color: Colors.grey.shade600)),
                        const Divider(height: 24),
                        _DetailLine('Tiền thuê phòng', formatCurrency(inv.rentAmount)),
                        _DetailLine('Tiền điện', formatCurrency(inv.electricityCost)),
                        _DetailLine('Tiền nước', formatCurrency(inv.waterCost)),
                        if (inv.otherFees > 0) _DetailLine('Phí khác', formatCurrency(inv.otherFees)),
                        const Divider(height: 24),
                        _DetailLine('Tổng cộng', formatCurrency(inv.totalAmount), bold: true),
                        const SizedBox(height: 8),
                        _DetailLine('Hạn thanh toán', formatDate(inv.dueDate)),
                        if (isPaid && inv.paidAt != null)
                          _DetailLine('Ngày thanh toán', formatDate(inv.paidAt!)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DetailLine extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  const _DetailLine(this.label, this.value, {this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(color: bold ? Colors.black : Colors.grey.shade700, fontWeight: bold ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal, fontSize: bold ? 16 : 14)),
      ]),
    );
  }
}
