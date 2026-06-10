import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] p-10 shrink-0"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0c1a3a 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(59,130,246,0.55)' }}
          >
            <span className="text-white text-sm font-black">R</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">RoomFlow</span>
        </div>

        <div>
          <h2 className="text-white text-3xl font-bold leading-tight mb-3">
            Quản lý khu trọ<br />thông minh
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Tối ưu hóa toàn bộ quy trình quản lý phòng trọ.<br />
            Tiết kiệm 2–3 giờ mỗi ngày.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Quản lý 50+ phòng trên nhiều cơ sở',
              'Hóa đơn điện nước tự động',
              'Theo dõi thanh toán theo thời gian thực',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2026 RoomFlow. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm animate-slideInUp">
          {/* Mobile logo */}
          <div
            className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-6 lg:hidden"
            style={{ boxShadow: '0 4px 16px rgba(59,130,246,0.45)' }}
          >
            <span className="text-white font-black">R</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đăng nhập</h1>
            <p className="text-gray-500 text-sm mt-1">Chào mừng trở lại</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="cin-input"
                placeholder="baochu@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="cin-input"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
