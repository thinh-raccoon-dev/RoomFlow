import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DoorOpen } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Room } from '@/types';

const STATUS_LABEL: Record<string, string> = { vacant: 'Trống', occupied: 'Đang thuê' };
const STATUS_COLOR: Record<string, string> = {
  vacant: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
};

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

  if (isLoading) return <div className="text-gray-400 text-center py-16">Đang tải...</div>;

  const vacant = rooms.filter(r => r.status === 'vacant').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh sách phòng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rooms.length} phòng · {vacant} trống · {rooms.length - vacant} đang thuê</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4">Thêm phòng mới</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'roomNumber', label: 'Số phòng', type: 'text', placeholder: '101' },
              { key: 'floor', label: 'Tầng', type: 'number', placeholder: '1' },
              { key: 'area', label: 'Diện tích (m²)', type: 'number', placeholder: '20' },
              { key: 'baseRent', label: 'Tiền thuê (VNĐ)', type: 'number', placeholder: '2000000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <DoorOpen size={18} className="text-gray-600" />
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLOR[room.status])}>
                {STATUS_LABEL[room.status]}
              </span>
            </div>
            <p className="font-semibold text-gray-900">Phòng {room.roomNumber}</p>
            <p className="text-xs text-gray-400">Tầng {room.floor} · {room.area}m²</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{formatCurrency(room.baseRent)}/tháng</p>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-5 text-center text-gray-400 py-16">Chưa có phòng nào</div>
        )}
      </div>
    </div>
  );
}
