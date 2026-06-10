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
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-primary">RoomFlow</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
