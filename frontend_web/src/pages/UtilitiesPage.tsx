import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Droplets, Plus } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Điện / Nước</h1>
          <p className="text-sm text-gray-500">{getMonthLabel(month, year)}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Phòng', 'Điện cũ', 'Điện mới', 'Tiêu thụ (kWh)', 'Tiền điện', 'Nước cũ', 'Nước mới', 'Tiêu thụ (m³)', 'Tiền nước', ''].map(h => (
                <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {occupiedRooms.map(room => {
              const reading = readingMap.get(room.id);
              const isEditing = editingRoom === room.id;

              return (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">Phòng {room.roomNumber}</td>
                  {isEditing ? (
                    <>
                      {(['electricityOld', 'electricityNew', null, null, 'waterOld', 'waterNew'] as const).map((key, i) =>
                        key ? (
                          <td key={i} className="px-3 py-2">
                            <input
                              type="number"
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              value={formData[key]}
                              onChange={e => setFormData(f => ({ ...f, [key]: Number(e.target.value) }))}
                            />
                          </td>
                        ) : <td key={i} className="px-3 py-2 text-gray-400">—</td>
                      )}
                      <td className="px-3 py-2 text-gray-400">—</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveMutation.mutate({ ...formData, roomId: room.id })}
                            disabled={saveMutation.isPending}
                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 disabled:opacity-50"
                          >Lưu</button>
                          <button onClick={() => setEditingRoom(null)}
                            className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">Hủy</button>
                        </div>
                      </td>
                    </>
                  ) : reading ? (
                    <>
                      <td className="px-3 py-2">{reading.electricityOld}</td>
                      <td className="px-3 py-2">{reading.electricityNew}</td>
                      <td className="px-3 py-2 font-medium">{reading.electricityUsed}</td>
                      <td className="px-3 py-2 text-blue-600">{formatCurrency(reading.electricityCost)}</td>
                      <td className="px-3 py-2">{reading.waterOld}</td>
                      <td className="px-3 py-2">{reading.waterNew}</td>
                      <td className="px-3 py-2 font-medium">{reading.waterUsed}</td>
                      <td className="px-3 py-2 text-blue-600">{formatCurrency(reading.waterCost)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => genInvoiceMutation.mutate(room.id)}
                          disabled={genInvoiceMutation.isPending}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:opacity-90 disabled:opacity-50"
                        >Tạo HĐ</button>
                      </td>
                    </>
                  ) : (
                    <>
                      {Array(8).fill(null).map((_, i) => (
                        <td key={i} className="px-3 py-2 text-gray-300">—</td>
                      ))}
                      <td className="px-3 py-2">
                        <button
                          onClick={() => { setEditingRoom(room.id); setFormData({ electricityOld: 0, electricityNew: 0, waterOld: 0, waterNew: 0 }); }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
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
