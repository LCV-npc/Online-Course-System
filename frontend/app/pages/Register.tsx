import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { UserPlus, Mail, Lock } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, authLoading } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ fontWeight: 800 }} className="text-gray-900 text-xl">
              Tạo tài khoản EduPro
            </h1>
            <p className="text-sm text-gray-500">Đăng ký để bắt đầu học ngay.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
              Họ và tên
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              type="text"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                type="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                type="password"
                required
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>}

          <button
            disabled={loading || authLoading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            style={{ fontWeight: 800 }}
          >
            {loading || authLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
          </button>

          <div className="text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline" style={{ fontWeight: 700 }}>
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
