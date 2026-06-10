import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: revenue } = useQuery({
    queryKey: ['revenue', year],
    queryFn: () => api.get('/reports/revenue', { params: { year } }).then(r => r.data),
  });

  const chartData = revenue?.monthly.map((m: { month: number; revenue: number }) => ({
    name: MONTHS[m.month - 1],
    revenue: m.revenue,
  })) || [];

  const totalRevenue = chartData.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0);
  const maxMonth = chartData.reduce((max: { revenue: number; name: string }, d: { revenue: number; name: string }) =>
    d.revenue > max.revenue ? d : max, { revenue: 0, name: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo tài chính</h1>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Tổng doanh thu {year}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Tháng doanh thu cao nhất</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{maxMonth.name || '—'}</p>
          <p className="text-sm text-gray-400">{formatCurrency(maxMonth.revenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-4">Doanh thu theo tháng - {year}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontWeight: 'bold' }} />
            <Bar dataKey="revenue" name="Doanh thu" fill="hsl(222.2 47.4% 11.2%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-4">Xu hướng doanh thu</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="hsl(222.2 47.4% 11.2%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
