import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import type { MaintenanceRequest, Room, User } from '@/types';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  in_progress: { label: 'Đang xử lý', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
  resolved: { label: 'Đã xong', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Hủy', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
};
const PRIORITY_COLOR = { low: 'text-gray-500', medium: 'text-yellow-600', high: 'text-red-600' };
const PRIORITY_LABEL = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };

export default function MaintenancePage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: requests = [], isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['maintenance', statusFilter],
    queryFn: () => api.get('/maintenance', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/maintenance/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yêu cầu sửa chữa</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="">Tất cả</option>
          <option value="pending">Chờ xử lý</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã xong</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-center py-16">Đang tải...</div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg = STATUS_CONFIG[req.status];
            const Icon = cfg.icon;
            const room = typeof req.room === 'object' ? req.room as Room : null;
            const tenant = typeof req.tenant === 'object' ? req.tenant as User : null;

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{req.title}</span>
                      <span className={cn('text-xs font-medium', PRIORITY_COLOR[req.priority])}>
                        [{PRIORITY_LABEL[req.priority]}]
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Phòng {room?.roomNumber ?? '—'}</span>
                      <span>{tenant?.name ?? '—'}</span>
                      <span>{formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium', cfg.bg, cfg.color)}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'in_progress' })}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:opacity-90"
                      >Nhận xử lý</button>
                    )}
                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'resolved' })}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:opacity-90"
                      >Đánh dấu xong</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {requests.length === 0 && (
            <div className="text-center text-gray-400 py-16">Không có yêu cầu sửa chữa nào</div>
          )}
        </div>
      )}
    </div>
  );
}
