import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate, getMonthLabel } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Invoice, Room, User } from '@/types';

const STATUS_COLOR = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hóa đơn</h1>
        <div className="flex items-center gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chưa trả</option>
            <option value="paid">Đã trả</option>
            <option value="overdue">Quá hạn</option>
          </select>
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

      {isLoading ? (
        <div className="text-gray-400 text-center py-16">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Hóa đơn', 'Phòng', 'Khách thuê', 'Thuê', 'Điện', 'Nước', 'Tổng', 'Hạn', 'Trạng thái'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => {
                const room = typeof inv.room === 'object' ? inv.room as Room : null;
                const tenant = typeof inv.tenant === 'object' ? inv.tenant as User : null;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-medium">{getMonthLabel(inv.month, inv.year)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">Phòng {room?.roomNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{tenant?.name ?? '—'}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.rentAmount)}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.electricityCost)}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.waterCost)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLOR[inv.status])}>
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
