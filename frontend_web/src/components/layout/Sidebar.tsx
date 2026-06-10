import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileSignature,
  CreditCard, Zap, FileText, Wrench, BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/properties', icon: Building2, label: 'Khu trọ' },
  { to: '/tenants', icon: Users, label: 'Khách thuê' },
  { to: '/contracts', icon: FileSignature, label: 'Hợp đồng' },
  { to: '/payments', icon: CreditCard, label: 'Thanh toán' },
  { to: '/utilities', icon: Zap, label: 'Điện / Nước' },
  { to: '/invoices', icon: FileText, label: 'Hóa đơn' },
  { to: '/maintenance', icon: Wrench, label: 'Sửa chữa' },
  { to: '/reports', icon: BarChart3, label: 'Báo cáo' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 0 16px rgba(59,130,246,0.55)' }}
          >
            <span className="text-white text-sm font-black leading-none">R</span>
          </div>
          <span className="text-white text-[17px] font-bold tracking-tight">RoomFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )
            }
            style={({ isActive }) =>
              isActive ? { boxShadow: '0 4px 14px rgba(59,130,246,0.40)' } : undefined
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800/70">
        <p className="text-[11px] text-slate-600 text-center tracking-wide">
          RoomFlow · 2026
        </p>
      </div>
    </aside>
  );
}
