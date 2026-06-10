import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, Zap, Droplets, DoorOpen } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { Property } from '@/types';

export default function PropertiesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', electricityPricePerKwh: 3500, waterPricePerM3: 15000 });

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => api.get('/properties').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/properties', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['properties'] }); setShowForm(false); },
  });

  if (isLoading) return <div className="text-gray-400 text-center py-16">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Khu trọ</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> Thêm khu trọ
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4">Thêm khu trọ mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên khu trọ *</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nhà trọ A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 Nguyễn Trãi, Q5, TP.HCM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá điện (VNĐ/kWh)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.electricityPricePerKwh}
                onChange={e => setForm(f => ({ ...f, electricityPricePerKwh: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá nước (VNĐ/m³)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={form.waterPricePerM3}
                onChange={e => setForm(f => ({ ...f, waterPricePerM3: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map(p => (
          <Link
            key={p.id}
            to={`/properties/${p.id}/rooms`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {p.address}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1"><DoorOpen size={14} /> {p.totalRooms ?? 0} phòng</span>
              <span className="flex items-center gap-1"><Zap size={14} /> {formatCurrency(p.electricityPricePerKwh)}/kWh</span>
              <span className="flex items-center gap-1"><Droplets size={14} /> {formatCurrency(p.waterPricePerM3)}/m³</span>
            </div>
          </Link>
        ))}
        {properties.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-16">
            Chưa có khu trọ nào. Nhấn "Thêm khu trọ" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
