import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate, getMonthLabel } from '../lib/utils';
import type { Invoice, Room, User } from '@/types';

const STATUS_BADGE: Record<string, string> = {
  paid:    'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
};
const STATUS_LABEL = { paid: 'Đã trả', pending: 'Chưa trả', overdue: 'Quá hạn' };

export default function InvoicesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState('');

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices', month, year, status],
    queryFn: () => api.get('/invoices', { params: { month, year, ...(status && { status }) } }).then(r => r.data),
  });

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Hóa đơn</h1>
        <div className="flex items-center gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)} className="cin-select">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chưa trả</option>
            <option value="paid">Đã trả</option>
            <option value="overdue">Quá hạn</option>
          </select>
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

      {isLoading ? (
        <div className="cin-card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-4">
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="cin-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Hóa đơn', 'Phòng', 'Khách thuê', 'Thuê', 'Điện', 'Nước', 'Tổng', 'Hạn', 'Trạng thái'].map(h => (
                  <th key={h} className="cin-table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const room   = typeof inv.room   === 'object' ? inv.room   as Room : null;
                const tenant = typeof inv.tenant === 'object' ? inv.tenant as User : null;
                return (
                  <tr key={inv.id} className="cin-table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-gray-300 shrink-0" />
                        <span className="font-medium text-gray-700">{getMonthLabel(inv.month, inv.year)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">Phòng {room?.roomNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{tenant?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.rentAmount)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.electricityCost)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.waterCost)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[inv.status]}>
                        {STATUS_LABEL[inv.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-gray-400 py-12">Không có hóa đơn nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
