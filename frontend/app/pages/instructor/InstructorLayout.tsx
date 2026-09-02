import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router';
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Settings, Shield,
  ChevronLeft, Menu, X, GraduationCap, Home, Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const menuItems = [
  { to: '/instructor', label: 'Chấm bài & Phản hồi', icon: <BarChart3 className="w-5 h-5" />, exact: true },
];

export default function InstructorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, isAuthenticated, authLoading } = useApp();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500" style={{ fontWeight: 700 }}>Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated || currentUser.role !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-7 text-center">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-orange-600" />
          </div>
          <h2 style={{ fontWeight: 800 }} className="text-gray-900 text-xl mb-2">
            Không đủ quyền Giảng viên
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng đăng nhập bằng tài khoản giảng viên để truy cập.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            style={{ fontWeight: 700 }}
          >
            Đi tới trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 flex-shrink-0 flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span style={{ fontWeight: 700 }} className="text-white">Giảng viên</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive(item.to, item.exact)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm" style={{ fontWeight: isActive(item.to, item.exact) ? 600 : 400 }}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Về trang chủ</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <h1 style={{ fontWeight: 700 }} className="text-gray-900">
            {menuItems.find(m => isActive(m.to, m.exact))?.label || 'Giảng viên'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{currentUser.name}</p>
                <p className="text-xs text-orange-600">Giảng viên</p>
              </div>
              <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
