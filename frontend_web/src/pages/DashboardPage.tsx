import { useQuery } from '@tanstack/react-query';
import { Building2, DoorOpen, TrendingUp, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { DashboardStats } from '@/types';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

function StatCard({
  icon: Icon, label, value, sub, color,
}: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reports/dashboard').then(r => r.data),
  });

  const { data: revenue } = useQuery<{ monthly: { month: number; revenue: number }[] }>({
    queryKey: ['revenue', new Date().getFullYear()],
    queryFn: () => api.get('/reports/revenue').then(r => r.data),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Đang tải...</div>;
  }

  const revenueData = revenue?.monthly.map(m => ({
    name: MONTHS[m.month - 1],
    revenue: m.revenue,
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2} label="Tỉ lệ lấp đầy"
          value={`${stats?.occupancyRate ?? 0}%`}
          sub={`${stats?.occupiedRooms}/${stats?.totalRooms} phòng`}
          color="bg-blue-500"
        />
        <StatCard
          icon={DoorOpen} label="Phòng trống"
          value={stats?.vacantRooms ?? 0}
          color="bg-orange-400"
        />
        <StatCard
          icon={TrendingUp} label="Doanh thu tháng này"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          color="bg-green-500"
        />
        <StatCard
          icon={AlertCircle} label="Chưa thanh toán"
          value={stats?.pendingPayments ?? 0}
          sub={`${stats?.overduePayments ?? 0} quá hạn`}
          color="bg-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-4">Doanh thu năm {new Date().getFullYear()}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="hsl(222.2 47.4% 11.2%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-4">Tình trạng khu trọ</h2>
          <div className="space-y-3">
            {stats?.propertyStats.map(p => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate">{p.name}</span>
                  <span className="text-gray-500 ml-2 shrink-0">{p.occupiedRooms}/{p.totalRooms}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: p.totalRooms > 0 ? `${(p.occupiedRooms / p.totalRooms) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
            {!stats?.propertyStats.length && (
              <p className="text-sm text-gray-400">Chưa có khu trọ nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
