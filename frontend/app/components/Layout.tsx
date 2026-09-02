import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import {
  BookOpen, Search, ShoppingCart, Bell, User, ChevronDown,
  Menu, X, LogOut, Settings, LayoutDashboard, GraduationCap, Shield
} from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, cart, notifications, unreadCount, markNotificationRead, isAuthenticated, logout, authLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/courses', label: 'Khóa Học' },
    { to: '/dashboard', label: 'Học Của Tôi' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-indigo-600" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                EduPro
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                />
              </div>
            </form>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm transition-colors ${
                    location.pathname === link.to
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                  style={{ fontWeight: location.pathname === link.to ? 600 : 400 }}
                >
                  {link.label}
                </Link>
              ))}
              {currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  style={{ fontWeight: 600 }}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              {currentUser.role === 'instructor' && (
                <Link
                  to="/instructor"
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  style={{ fontWeight: 600 }}
                >
                  <GraduationCap className="w-4 h-4" />
                  Giảng viên
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                  className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <span style={{ fontWeight: 600 }} className="text-gray-800">Thông báo</span>
                      <span className="text-xs text-indigo-600">{unreadCount} chưa đọc</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 5).map(n => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.read ? 'bg-indigo-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <p className="text-sm text-gray-800" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                        currentUser.role === 'admin' ? 'bg-orange-100 text-orange-700' 
                        : currentUser.role === 'instructor' ? 'bg-orange-100 text-orange-700'
                        : 'bg-indigo-100 text-indigo-700'
                      }`} style={{ fontWeight: 600 }}>
                        {currentUser.role === 'admin' ? 'Quản trị viên' 
                         : currentUser.role === 'instructor' ? 'Giảng viên' 
                         : 'Học viên'}
                      </span>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển
                      </Link>
                      {currentUser.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Quản trị hệ thống
                        </Link>
                      )}
                      {currentUser.role === 'instructor' && (
                        <Link
                          to="/instructor"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <GraduationCap className="w-4 h-4" /> Trang giảng viên
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <p className="px-3 py-1 text-xs text-gray-400">
                        {isAuthenticated ? 'Tài khoản' : 'Truy cập'}
                      </p>
                      {!isAuthenticated && !authLoading && (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full"
                          >
                            <User className="w-4 h-4" /> Đăng nhập
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full"
                          >
                            <Shield className="w-4 h-4" /> Tạo tài khoản
                          </Link>
                        </>
                      )}
                      {isAuthenticated && (
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            navigate('/');
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </form>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-gray-700 hover:text-indigo-600"
                >
                  {link.label}
                </Link>
              ))}
              {currentUser.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-orange-600">
                  Admin Panel
                </Link>
              )}
              {currentUser.role === 'instructor' && (
                <Link to="/instructor" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-orange-600">
                  Trang Giảng viên
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white" style={{ fontWeight: 700 }}>EduPro</span>
              </div>
              <p className="text-sm">Nền tảng học trực tuyến hàng đầu Việt Nam với hàng nghìn khóa học chất lượng cao.</p>
            </div>
            <div>
              <p className="text-white mb-3" style={{ fontWeight: 600 }}>Khóa Học</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="hover:text-white transition-colors">Lập trình</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Data Science</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Thiết kế</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Marketing</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white mb-3" style={{ fontWeight: 600 }}>Hỗ Trợ</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm hỗ trợ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white mb-3" style={{ fontWeight: 600 }}>Liên Hệ</p>
              <ul className="space-y-2 text-sm">
                <li>📧 support@edupro.vn</li>
                <li>📞 1800-1234 (Miễn phí)</li>
                <li>📍 123 Đường ABC, Q.1, TP.HCM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            © 2024 EduPro. Bản quyền thuộc về EduPro Vietnam.
          </div>
        </div>
      </footer>
    </div>
  );
}
