import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
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

  const chartData = (revenue?.monthly ?? []).map((m: { month: number; revenue: number }) => ({
    name:    MONTHS[m.month - 1],
    revenue: m.revenue,
    month:   m.month,
  }));

  const totalRevenue = chartData.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0);
  const maxMonth     = chartData.reduce(
    (max: { revenue: number; name: string }, d: { revenue: number; name: string }) =>
      d.revenue > max.revenue ? d : max,
    { revenue: 0, name: '' }
  );
  const currentMonth = new Date().getMonth() + 1;

  const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Báo cáo tài chính</h1>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="cin-select">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="cin-card p-5 border-l-4" style={{ borderLeftColor: '#10B981' }}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500" style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
              <DollarSign size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng doanh thu {year}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="cin-card p-5 border-l-4" style={{ borderLeftColor: '#3B82F6' }}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500" style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tháng doanh thu cao nhất</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{maxMonth.name || '—'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{maxMonth.revenue ? formatCurrency(maxMonth.revenue) : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="cin-card p-5">
        <h2 className="section-title mb-1">Doanh thu theo tháng — {year}</h2>
        <p className="text-xs text-gray-400 mb-5">Đơn vị: triệu đồng</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={v => `${(v / 1_000_000).toFixed(0)}tr`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="revenue" name="Doanh thu" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((entry: { month: number; name: string }) => (
                <Cell
                  key={entry.name}
                  fill={entry.month === currentMonth ? '#3B82F6' : '#bfdbfe'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart */}
      <div className="cin-card p-5">
        <h2 className="section-title mb-1">Xu hướng doanh thu</h2>
        <p className="text-xs text-gray-400 mb-5">So sánh các tháng trong năm</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={v => `${(v / 1_000_000).toFixed(0)}tr`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
              contentStyle={tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
