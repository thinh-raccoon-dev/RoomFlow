import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { formatDate } from '../lib/utils';
import type { MaintenanceRequest, Room, User } from '@/types';

const STATUS_CONFIG = {
  pending:     { label: 'Chờ xử lý', icon: Clock,         badge: 'badge-warning', glow: 'rgba(245,158,11,0.15)' },
  in_progress: { label: 'Đang xử lý', icon: Wrench,        badge: 'badge-info',    glow: 'rgba(59,130,246,0.15)' },
  resolved:    { label: 'Đã xong',    icon: CheckCircle,   badge: 'badge-success', glow: 'rgba(16,185,129,0.15)' },
  cancelled:   { label: 'Hủy',        icon: AlertCircle,   badge: 'badge-neutral', glow: 'rgba(148,163,184,0.15)' },
};

const PRIORITY_BADGE = {
  low:    'badge-neutral',
  medium: 'badge-warning',
  high:   'badge-error',
};
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
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Yêu cầu sửa chữa</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="cin-select">
          <option value="">Tất cả</option>
          <option value="pending">Chờ xử lý</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã xong</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="cin-card p-5 space-y-3">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-40" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg    = STATUS_CONFIG[req.status];
            const Icon   = cfg.icon;
            const room   = typeof req.room   === 'object' ? req.room   as Room : null;
            const tenant = typeof req.tenant === 'object' ? req.tenant as User : null;

            return (
              <div
                key={req.id}
                className="cin-card p-5 border-l-4"
                style={{
                  borderLeftColor: req.priority === 'high' ? '#EF4444' : req.priority === 'medium' ? '#F59E0B' : '#94a3b8',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900">{req.title}</span>
                      <span className={PRIORITY_BADGE[req.priority]}>
                        {PRIORITY_LABEL[req.priority]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Phòng {room?.roomNumber ?? '—'}</span>
                      <span>{tenant?.name ?? '—'}</span>
                      <span>{formatDate(req.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cfg.badge}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'in_progress' })}
                        className="btn-primary py-1 px-3 text-xs"
                      >
                        Nhận xử lý
                      </button>
                    )}
                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'resolved' })}
                        className="btn-primary py-1 px-3 text-xs"
                        style={{ background: '#10B981', boxShadow: '0 2px 8px rgba(16,185,129,0.28)' }}
                      >
                        Đánh dấu xong
                      </button>
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
