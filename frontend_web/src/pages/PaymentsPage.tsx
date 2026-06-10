import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, getMonthLabel } from '../lib/utils';
import type { Invoice } from '@/types';

const STATUS_CONFIG = {
  paid:    { label: 'Đã trả',   icon: CheckCircle,  badge: 'badge-success', border: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
  pending: { label: 'Chưa trả', icon: Clock,         badge: 'badge-warning', border: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
  overdue: { label: 'Quá hạn',  icon: AlertTriangle, badge: 'badge-error',   border: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
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

  const paid    = invoices.filter(i => i.status === 'paid');
  const pending = invoices.filter(i => i.status === 'pending');
  const overdue = invoices.filter(i => i.status === 'overdue');

  const summaryItems = [
    { key: 'paid',    label: 'Đã thanh toán', count: paid.length,    total: paid.reduce((s, i) => s + i.totalAmount, 0)    },
    { key: 'pending', label: 'Chưa thanh toán', count: pending.length, total: pending.reduce((s, i) => s + i.totalAmount, 0) },
    { key: 'overdue', label: 'Quá hạn',        count: overdue.length, total: overdue.reduce((s, i) => s + i.totalAmount, 0) },
  ] as const;

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Thanh toán</h1>
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {summaryItems.map(s => {
          const cfg = STATUS_CONFIG[s.key];
          return (
            <div
              key={s.key}
              className="cin-card p-4 border-l-4"
              style={{ borderLeftColor: cfg.border, background: cfg.bg }}
            >
              <p className="text-sm font-semibold text-gray-600">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{s.count}</p>
              <p className="text-sm text-gray-500 mt-0.5">{formatCurrency(s.total)}</p>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="cin-card p-4 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="cin-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Phòng', 'Khách thuê', 'Tiền thuê', 'Điện', 'Nước', 'Tổng cộng', 'Trạng thái', ''].map(h => (
                  <th key={h} className="cin-table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const cfg    = STATUS_CONFIG[inv.status];
                const Icon   = cfg.icon;
                const room   = typeof inv.room   === 'object' ? inv.room   : null;
                const tenant = typeof inv.tenant === 'object' ? inv.tenant : null;
                return (
                  <tr key={inv.id} className="cin-table-row">
                    <td className="px-4 py-3 font-medium">Phòng {room?.roomNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{tenant?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.rentAmount)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.electricityCost)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.waterCost)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={cfg.badge}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => markPaidMutation.mutate(inv.id)}
                          disabled={markPaidMutation.isPending}
                          className="btn-primary py-1 px-3 text-xs"
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
