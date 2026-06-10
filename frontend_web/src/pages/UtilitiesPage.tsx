import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, getMonthLabel } from '../lib/utils';
import type { Room, UtilityReading } from '@/types';

export default function UtilitiesPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [formData, setFormData] = useState({ electricityOld: 0, electricityNew: 0, waterOld: 0, waterNew: 0 });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: () => api.get('/rooms').then(r => r.data),
  });

  const { data: readings = [] } = useQuery<UtilityReading[]>({
    queryKey: ['utility-readings', month, year],
    queryFn: () => api.get('/utility-readings', { params: { month, year } }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData & { roomId: string }) =>
      api.post('/utility-readings', { room: data.roomId, month, year, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['utility-readings', month, year] });
      setEditingRoom(null);
    },
  });

  const genInvoiceMutation = useMutation({
    mutationFn: (roomId: string) => api.post('/invoices/generate', { roomId, month, year }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const readingMap = new Map(readings.map(r => {
    const roomId = typeof r.room === 'object' ? (r.room as Room).id : r.room;
    return [roomId, r];
  }));

  const occupiedRooms = rooms.filter(r => r.status === 'occupied');

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Điện / Nước</h1>
          <p className="text-sm text-gray-400 mt-0.5">{getMonthLabel(month, year)}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="cin-select">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="cin-select">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="cin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Phòng', 'Điện cũ', 'Điện mới', 'Tiêu thụ (kWh)', 'Tiền điện', 'Nước cũ', 'Nước mới', 'Tiêu thụ (m³)', 'Tiền nước', ''].map(h => (
                <th key={h} className="cin-table-header whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {occupiedRooms.map(room => {
              const reading = readingMap.get(room.id);
              const isEditing = editingRoom === room.id;

              return (
                <tr key={room.id} className="cin-table-row">
                  <td className="px-3 py-2.5 font-semibold text-gray-900">Phòng {room.roomNumber}</td>
                  {isEditing ? (
                    <>
                      {(['electricityOld', 'electricityNew', null, null, 'waterOld', 'waterNew'] as const).map((key, i) =>
                        key ? (
                          <td key={i} className="px-3 py-2">
                            <input
                              type="number"
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                              value={formData[key]}
                              onChange={e => setFormData(f => ({ ...f, [key]: Number(e.target.value) }))}
                            />
                          </td>
                        ) : <td key={i} className="px-3 py-2 text-gray-300">—</td>
                      )}
                      <td className="px-3 py-2 text-gray-300">—</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => saveMutation.mutate({ ...formData, roomId: room.id })}
                            disabled={saveMutation.isPending}
                            className="btn-primary py-1 px-2.5 text-xs"
                          >
                            Lưu
                          </button>
                          <button onClick={() => setEditingRoom(null)} className="btn-ghost py-1 px-2.5 text-xs">Hủy</button>
                        </div>
                      </td>
                    </>
                  ) : reading ? (
                    <>
                      <td className="px-3 py-2.5 text-gray-600">{reading.electricityOld}</td>
                      <td className="px-3 py-2.5 text-gray-600">{reading.electricityNew}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">{reading.electricityUsed}</td>
                      <td className="px-3 py-2.5 font-medium text-amber-600">{formatCurrency(reading.electricityCost)}</td>
                      <td className="px-3 py-2.5 text-gray-600">{reading.waterOld}</td>
                      <td className="px-3 py-2.5 text-gray-600">{reading.waterNew}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">{reading.waterUsed}</td>
                      <td className="px-3 py-2.5 font-medium text-blue-600">{formatCurrency(reading.waterCost)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => genInvoiceMutation.mutate(room.id)}
                          disabled={genInvoiceMutation.isPending}
                          className="btn-primary py-1 px-2.5 text-xs"
                          style={{ background: '#10B981', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}
                        >
                          Tạo HĐ
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      {Array(8).fill(null).map((_, i) => (
                        <td key={i} className="px-3 py-2.5 text-gray-200">—</td>
                      ))}
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => { setEditingRoom(room.id); setFormData({ electricityOld: 0, electricityNew: 0, waterOld: 0, waterNew: 0 }); }}
                          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                        >
                          <Plus size={12} /> Nhập
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {occupiedRooms.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-gray-400 py-12">Không có phòng nào đang cho thuê</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
