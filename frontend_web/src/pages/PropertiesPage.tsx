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

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Khu trọ</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} /> Thêm khu trọ
        </button>
      </div>

      {showForm && (
        <div className="cin-card p-5">
          <h2 className="section-title mb-4">Thêm khu trọ mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên khu trọ *</label>
              <input
                className="cin-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nhà trọ A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ *</label>
              <input
                className="cin-input"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 Nguyễn Trãi, Q5, TP.HCM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá điện (VNĐ/kWh)</label>
              <input
                type="number"
                className="cin-input"
                value={form.electricityPricePerKwh}
                onChange={e => setForm(f => ({ ...f, electricityPricePerKwh: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá nước (VNĐ/m³)</label>
              <input
                type="number"
                className="cin-input"
                value={form.waterPricePerM3}
                onChange={e => setForm(f => ({ ...f, waterPricePerM3: Number(e.target.value) }))}
              />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cin-card p-5 space-y-3">
              <div className="flex gap-3">
                <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map(p => (
            <Link
              key={p.id}
              to={`/properties/${p.id}/rooms`}
              className="cin-card cin-card-hover p-5 block"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
                  <Building2 size={20} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {p.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1 font-medium">
                  <DoorOpen size={13} className="text-gray-400" /> {p.totalRooms ?? 0} phòng
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={13} className="text-amber-400" /> {formatCurrency(p.electricityPricePerKwh)}/kWh
                </span>
                <span className="flex items-center gap-1">
                  <Droplets size={13} className="text-blue-400" /> {formatCurrency(p.waterPricePerM3)}/m³
                </span>
              </div>
            </Link>
          ))}
          {properties.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-16">
              Chưa có khu trọ nào. Nhấn "Thêm khu trọ" để bắt đầu.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
