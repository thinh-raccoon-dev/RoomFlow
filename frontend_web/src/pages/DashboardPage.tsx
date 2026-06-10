import { useQuery } from '@tanstack/react-query';
import { Building2, DoorOpen, TrendingUp, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { DashboardStats } from '@/types';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const STAT_CARDS = [
  {
    icon: Building2,
    label: 'Tỉ lệ lấp đầy',
    getValue: (s: DashboardStats) => `${s.occupancyRate}%`,
    getSub:   (s: DashboardStats) => `${s.occupiedRooms}/${s.totalRooms} phòng`,
    iconBg:   'bg-blue-500',
    iconGlow: 'rgba(59,130,246,0.35)',
    border:   '#3B82F6',
  },
  {
    icon: DoorOpen,
    label: 'Phòng trống',
    getValue: (s: DashboardStats) => String(s.vacantRooms),
    getSub:   () => undefined,
    iconBg:   'bg-amber-500',
    iconGlow: 'rgba(245,158,11,0.35)',
    border:   '#F59E0B',
  },
  {
    icon: TrendingUp,
    label: 'Doanh thu tháng này',
    getValue: (s: DashboardStats) => formatCurrency(s.totalRevenue),
    getSub:   () => undefined,
    iconBg:   'bg-emerald-500',
    iconGlow: 'rgba(16,185,129,0.35)',
    border:   '#10B981',
  },
  {
    icon: AlertCircle,
    label: 'Chưa thanh toán',
    getValue: (s: DashboardStats) => String(s.pendingPayments),
    getSub:   (s: DashboardStats) => `${s.overduePayments} quá hạn`,
    iconBg:   'bg-red-500',
    iconGlow: 'rgba(239,68,68,0.35)',
    border:   '#EF4444',
  },
];

function StatCard({
  icon: Icon, label, value, sub, iconBg, iconGlow, border,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  iconBg: string; iconGlow: string; border: string;
}) {
  return (
    <div
      className="cin-card p-5 flex items-start gap-4 border-l-4"
      style={{ borderLeftColor: border }}
    >
      <div
        className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}
        style={{ boxShadow: `0 4px 12px ${iconGlow}` }}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="cin-card p-5 flex items-start gap-4 border-l-4 border-gray-200">
      <div className="w-11 h-11 skeleton rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-7 w-20" />
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

  const revenueData = revenue?.monthly.map(m => ({
    name: MONTHS[m.month - 1],
    revenue: m.revenue,
    month: m.month,
  })) ?? [];

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-6 animate-slideInUp">
      <div>
        <h1 className="page-title">Tổng quan</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)
          : STAT_CARDS.map(cfg => (
              <StatCard
                key={cfg.label}
                icon={cfg.icon}
                label={cfg.label}
                value={cfg.getValue(stats!)}
                sub={cfg.getSub(stats!)}
                iconBg={cfg.iconBg}
                iconGlow={cfg.iconGlow}
                border={cfg.border}
              />
            ))
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 cin-card p-5">
          <h2 className="section-title mb-1">Doanh thu năm {new Date().getFullYear()}</h2>
          <p className="text-xs text-gray-400 mb-4">Theo tháng (triệu đồng)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `${(v / 1_000_000).toFixed(0)}tr`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {revenueData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={entry.month === currentMonth ? '#3B82F6' : '#bfdbfe'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Property occupancy */}
        <div className="cin-card p-5">
          <h2 className="section-title mb-1">Tình trạng khu trọ</h2>
          <p className="text-xs text-gray-400 mb-4">Tỉ lệ lấp đầy theo cơ sở</p>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-3 w-3/4" />
                  <div className="skeleton h-2 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.propertyStats.map(p => {
                const pct = p.totalRooms > 0 ? (p.occupiedRooms / p.totalRooms) * 100 : 0;
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium truncate">{p.name}</span>
                      <span className="text-gray-400 ml-2 shrink-0 text-xs">
                        {p.occupiedRooms}/{p.totalRooms}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 80 ? '#10B981' : pct >= 50 ? '#3B82F6' : '#F59E0B',
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">{pct.toFixed(0)}% lấp đầy</p>
                  </div>
                );
              })}
              {!stats?.propertyStats.length && (
                <p className="text-sm text-gray-400 text-center py-8">Chưa có khu trọ nào</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
