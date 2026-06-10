import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Phone, Mail } from 'lucide-react';
import api from '../lib/api';
import type { User as IUser } from '@/types';

export default function TenantsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '123456' });

  const { data: tenants = [], isLoading } = useQuery<IUser[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/tenants', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); setShowForm(false); },
  });

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Khách thuê</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} /> Thêm khách thuê
        </button>
      </div>

      {showForm && (
        <div className="cin-card p-5">
          <h2 className="section-title mb-4">Thêm khách thuê mới</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'name',     label: 'Họ tên',        type: 'text',     placeholder: 'Nguyễn Văn A'  },
              { key: 'email',    label: 'Email',          type: 'email',    placeholder: 'example@gmail.com' },
              { key: 'phone',    label: 'Số điện thoại',  type: 'tel',      placeholder: '0901234567'    },
              { key: 'password', label: 'Mật khẩu app',   type: 'text',     placeholder: '123456'        },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  className="cin-input"
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
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
        <div className="cin-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 border-b border-gray-50">
              <div className="skeleton w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cin-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Khách thuê', 'Email', 'Số điện thoại'].map(h => (
                  <th key={h} className="cin-table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="cin-table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ boxShadow: '0 2px 6px rgba(59,130,246,0.3)' }}
                      >
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-300" />{t.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-300" />{t.phone}</span>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-12">Chưa có khách thuê nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
