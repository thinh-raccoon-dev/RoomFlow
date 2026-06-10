import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-white flex items-center justify-end px-6 gap-4"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
        <div
          className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}
        >
          {initials}
        </div>
        <span className="text-sm text-gray-700 font-medium pr-0.5">{user?.name}</span>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
      >
        <LogOut size={15} />
        Đăng xuất
      </button>
    </header>
  );
}
