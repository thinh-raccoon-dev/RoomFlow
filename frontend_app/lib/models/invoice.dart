class Invoice {
  final String id;
  final String roomNumber;
  final int month;
  final int year;
  final double rentAmount;
  final double electricityCost;
  final double waterCost;
  final double otherFees;
  final double totalAmount;
  final String status;
  final String dueDate;
  final String? paidAt;

  const Invoice({
    required this.id,
    required this.roomNumber,
    required this.month,
    required this.year,
    required this.rentAmount,
    required this.electricityCost,
    required this.waterCost,
    required this.otherFees,
    required this.totalAmount,
    required this.status,
    required this.dueDate,
    this.paidAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    final room = json['room'];
    return Invoice(
      id: json['_id'] as String? ?? json['id'] as String,
      roomNumber: room is Map ? room['roomNumber'] as String : '—',
      month: json['month'] as int,
      year: json['year'] as int,
      rentAmount: (json['rentAmount'] as num).toDouble(),
      electricityCost: (json['electricityCost'] as num).toDouble(),
      waterCost: (json['waterCost'] as num).toDouble(),
      otherFees: (json['otherFees'] as num).toDouble(),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      status: json['status'] as String,
      dueDate: json['dueDate'] as String,
      paidAt: json['paidAt'] as String?,
    );
  }
}
