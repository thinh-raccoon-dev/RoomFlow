import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileSignature, Calendar, User as UserIcon } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Contract, Room, User } from '@/types';

const STATUS_BADGE: Record<string, string> = {
  active:  'badge-success',
  pending: 'badge-warning',
  ended:   'badge-neutral',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hiệu lực',
  pending: 'Chờ hiệu lực',
  ended: 'Đã kết thúc',
};

const today       = () => new Date().toISOString().slice(0, 10);
const oneYearLater = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); };
const emptyForm   = { room: '', tenant: '', startDate: today(), endDate: oneYearLater(), rentPrice: 0, deposit: 0, notes: '' };

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
      setShowForm(false); setForm({ ...emptyForm }); setError('');
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
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Hợp đồng</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn-primary">
          <Plus size={15} /> Tạo hợp đồng
        </button>
      </div>

      {showForm && (
        <div className="cin-card p-5">
          <h2 className="section-title mb-4">Tạo hợp đồng mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phòng (còn trống) *</label>
              <select className="cin-select w-full" value={form.room} onChange={e => onSelectRoom(e.target.value)}>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Khách thuê *</label>
              <select className="cin-select w-full" value={form.tenant} onChange={e => setForm(f => ({ ...f, tenant: e.target.value }))}>
                <option value="">-- Chọn khách thuê --</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name} · {t.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày bắt đầu *</label>
              <input type="date" className="cin-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày kết thúc *</label>
              <input type="date" className="cin-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiền thuê (VNĐ/tháng) *</label>
              <input type="number" className="cin-input" value={form.rentPrice} onChange={e => setForm(f => ({ ...f, rentPrice: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiền cọc (VNĐ)</label>
              <input type="number" className="cin-input" value={form.deposit} onChange={e => setForm(f => ({ ...f, deposit: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
              <input className="cin-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tùy chọn" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 flex items-center gap-1">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={!canSubmit || createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Hủy</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="cin-card p-4 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="cin-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Phòng', 'Khách thuê', 'Thời hạn', 'Tiền thuê', 'Cọc', 'Trạng thái', ''].map(h => (
                  <th key={h} className="cin-table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => {
                const room   = typeof c.room   === 'object' ? c.room   as Room : null;
                const tenant = typeof c.tenant === 'object' ? c.tenant as User : null;
                return (
                  <tr key={c.id} className="cin-table-row">
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <FileSignature size={14} className="text-gray-300 shrink-0" />
                        Phòng {room?.roomNumber ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1.5"><UserIcon size={13} className="text-gray-300" />{tenant?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-300" />
                        {formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(c.rentPrice)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(c.deposit)}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</span>
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
                          className="btn-danger-ghost"
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
