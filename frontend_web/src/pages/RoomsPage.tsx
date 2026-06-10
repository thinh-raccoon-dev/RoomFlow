import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DoorOpen } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { Room } from '@/types';

const STATUS_LABEL: Record<string, string> = { vacant: 'Trống', occupied: 'Đang thuê' };

export default function RoomsPage() {
  const { id: propertyId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', floor: 1, area: 20, baseRent: 2000000, description: '' });

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ['rooms', propertyId],
    queryFn: () => api.get('/rooms', { params: { propertyId } }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/rooms', { ...data, property: propertyId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms', propertyId] }); setShowForm(false); },
  });

  const vacant = rooms.filter(r => r.status === 'vacant').length;

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Danh sách phòng</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {rooms.length} phòng · {vacant} trống · {rooms.length - vacant} đang thuê
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} /> Thêm phòng
        </button>
      </div>

      {showForm && (
        <div className="cin-card p-5">
          <h2 className="section-title mb-4">Thêm phòng mới</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'roomNumber', label: 'Số phòng', type: 'text', placeholder: '101' },
              { key: 'floor', label: 'Tầng', type: 'number', placeholder: '1' },
              { key: 'area', label: 'Diện tích (m²)', type: 'number', placeholder: '20' },
              { key: 'baseRent', label: 'Tiền thuê (VNĐ)', type: 'number', placeholder: '2000000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  className="cin-input"
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Hủy</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="cin-card p-4 space-y-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-3 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {rooms.map(room => (
            <div key={room.id} className="cin-card cin-card-hover p-4 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: room.status === 'occupied' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)' }}
                >
                  <DoorOpen
                    size={18}
                    style={{ color: room.status === 'occupied' ? '#3B82F6' : '#10B981' }}
                  />
                </div>
                <span className={room.status === 'occupied' ? 'badge-info' : 'badge-success'}>
                  {STATUS_LABEL[room.status]}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">Phòng {room.roomNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">Tầng {room.floor} · {room.area}m²</p>
              <p className="text-sm font-semibold text-gray-700 mt-1.5">{formatCurrency(room.baseRent)}<span className="font-normal text-gray-400">/tháng</span></p>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-5 text-center text-gray-400 py-16">Chưa có phòng nào</div>
          )}
        </div>
      )}
    </div>
  );
}
