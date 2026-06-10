class MaintenanceRequest {
  final String id;
  final String title;
  final String description;
  final String priority;
  final String status;
  final List<String> images;
  final String createdAt;
  final String roomNumber;

  const MaintenanceRequest({
    required this.id,
    required this.title,
    required this.description,
    required this.priority,
    required this.status,
    required this.images,
    required this.createdAt,
    required this.roomNumber,
  });

  factory MaintenanceRequest.fromJson(Map<String, dynamic> json) {
    final room = json['room'];
    return MaintenanceRequest(
      id: json['_id'] as String? ?? json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      priority: json['priority'] as String,
      status: json['status'] as String,
      images: List<String>.from(json['images'] ?? []),
      createdAt: json['createdAt'] as String,
      roomNumber: room is Map ? room['roomNumber'] as String : '—',
    );
  }
}
