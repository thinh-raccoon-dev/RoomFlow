import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, getMonthLabel } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Invoice } from '@/types';

const STATUS_CONFIG = {
  paid: { label: 'Đã trả', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  pending: { label: 'Chưa trả', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  overdue: { label: 'Quá hạn', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function PaymentsPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices', month, year],
    queryFn: () => api.get('/invoices', { params: { month, year } }).then(r => r.data),
  });

  const markPaidMutation = useMutation({
    mutationFn: (invoiceId: string) => api.post('/payments', { invoiceId, amount: 0, method: 'cash' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', month, year] }),
  });

  const pending = invoices.filter(i => i.status === 'pending');
  const paid = invoices.filter(i => i.status === 'paid');
  const overdue = invoices.filter(i => i.status === 'overdue');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
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

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Đã thanh toán', count: paid.length, total: paid.reduce((s, i) => s + i.totalAmount, 0), color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
          { label: 'Chưa thanh toán', count: pending.length, total: pending.reduce((s, i) => s + i.totalAmount, 0), color: 'border-yellow-200 bg-yellow-50', textColor: 'text-yellow-700' },
          { label: 'Quá hạn', count: overdue.length, total: overdue.reduce((s, i) => s + i.totalAmount, 0), color: 'border-red-200 bg-red-50', textColor: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className={cn('text-sm font-medium', s.textColor)}>{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.count}</p>
            <p className="text-sm text-gray-500">{formatCurrency(s.total)}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-center py-8">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Phòng', 'Khách thuê', 'Tiền thuê', 'Điện', 'Nước', 'Tổng cộng', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => {
                const cfg = STATUS_CONFIG[inv.status];
                const Icon = cfg.icon;
                const room = typeof inv.room === 'object' ? inv.room : null;
                const tenant = typeof inv.tenant === 'object' ? inv.tenant : null;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Phòng {room?.roomNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{tenant?.name ?? '—'}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.rentAmount)}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.electricityCost)}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.waterCost)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit', cfg.bg, cfg.color)}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => markPaidMutation.mutate(inv.id)}
                          disabled={markPaidMutation.isPending}
                          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90 disabled:opacity-50"
                        >
                          Đánh dấu đã thu
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-12">
                    Chưa có hóa đơn nào cho {getMonthLabel(month, year)}
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
