import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileSignature, Calendar, User as UserIcon } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Contract, Room, User } from '@/types';

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hiệu lực',
  pending: 'Chờ hiệu lực',
  ended: 'Đã kết thúc',
};

const today = () => new Date().toISOString().slice(0, 10);
const oneYearLater = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

const emptyForm = {
  room: '',
  tenant: '',
  startDate: today(),
  endDate: oneYearLater(),
  rentPrice: 0,
  deposit: 0,
  notes: '',
};

export default function ContractsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: () => api.get('/contracts').then(r => r.data),
  });

  const { data: vacantRooms = [] } = useQuery<Room[]>({
    queryKey: ['rooms', 'vacant'],
    queryFn: () => api.get('/rooms', { params: { status: 'vacant' } }).then(r => r.data),
  });

  const { data: tenants = [] } = useQuery<User[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/contracts', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setShowForm(false);
      setForm({ ...emptyForm });
      setError('');
    },
    onError: () => setError('Không tạo được hợp đồng. Phòng có thể đã có hợp đồng đang hiệu lực.'),
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => api.put(`/contracts/${id}/end`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  function onSelectRoom(roomId: string) {
    const room = vacantRooms.find(r => r.id === roomId);
    setForm(f => ({ ...f, room: roomId, rentPrice: room?.baseRent ?? f.rentPrice }));
  }

  const canSubmit = form.room && form.tenant && form.startDate && form.endDate && form.rentPrice > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hợp đồng</h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> Tạo hợp đồng
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4">Tạo hợp đồng mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phòng (còn trống) *</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.room}
                onChange={e => onSelectRoom(e.target.value)}
              >
                <option value="">-- Chọn phòng --</option>
                {vacantRooms.map(r => {
                  const property = typeof r.property === 'object' ? r.property : null;
                  return (
                    <option key={r.id} value={r.id}>
                      Phòng {r.roomNumber}{property ? ` · ${property.name}` : ''} ({formatCurrency(r.baseRent)})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Khách thuê *</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.tenant}
                onChange={e => setForm(f => ({ ...f, tenant: e.target.value }))}
              >
                <option value="">-- Chọn khách thuê --</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} · {t.phone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày kết thúc *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiền thuê (VNĐ/tháng) *</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.rentPrice}
                onChange={e => setForm(f => ({ ...f, rentPrice: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiền cọc (VNĐ)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.deposit}
                onChange={e => setForm(f => ({ ...f, deposit: Number(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Tùy chọn"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!canSubmit || createMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50">
              Hủy
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400 text-center py-16">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Phòng', 'Khách thuê', 'Thời hạn', 'Tiền thuê', 'Cọc', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map(c => {
                const room = typeof c.room === 'object' ? c.room as Room : null;
                const tenant = typeof c.tenant === 'object' ? c.tenant as User : null;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <FileSignature size={15} className="text-gray-400" />
                        Phòng {room?.roomNumber ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1.5"><UserIcon size={13} />{tenant?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />{formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(c.rentPrice)}</td>
                    <td className="px-4 py-3">{formatCurrency(c.deposit)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLOR[c.status])}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'active' && (
                        <button
                          onClick={() => {
                            if (confirm('Kết thúc hợp đồng này? Phòng sẽ chuyển về trạng thái trống.')) {
                              endMutation.mutate(c.id);
                            }
                          }}
                          disabled={endMutation.isPending}
                          className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                        >
                          Kết thúc
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-12">
                    Chưa có hợp đồng nào. Nhấn "Tạo hợp đồng" để gắn khách thuê vào phòng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
