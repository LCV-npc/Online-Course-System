import React, { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { CourseCard } from '../components/CourseCard';
import {
  BookOpen, Award, Clock, TrendingUp, Play, Star, BarChart3,
  Calendar, Bell, CheckCircle, Trophy
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import styles or components if needed

export default function Dashboard() {
  const { currentUser, enrollments, allCourses, getProgress, notifications, markNotificationRead, weeklyActivity } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'inProgress' | 'completed'>('all');

  const userEnrollments = enrollments.filter(e => e.userId === currentUser.id);
  const completedCount = userEnrollments.filter(e => e.completed && e.grade && e.grade >= 70).length;
  const inProgressCount = userEnrollments.filter(e => !e.completed || !e.grade || e.grade < 70).length;
  const totalStudyMinutes = weeklyActivity.reduce((s, d) => s + (d.minutes || 0), 0);

  const getEnrolledCourses = () => {
    let enrs = userEnrollments;
    if (activeTab === 'inProgress') enrs = enrs.filter(e => !e.completed || !e.grade || e.grade < 70);
    if (activeTab === 'completed') enrs = enrs.filter(e => e.completed && e.grade && e.grade >= 70);
    return enrs.map(e => allCourses.find(c => c.id === e.courseId)).filter(Boolean);
  };

  const enrolledCourses = getEnrolledCourses();
  const unreadNotifs = notifications.filter(n => !n.read).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-white/30" />
          <div>
            <p className="text-indigo-200 text-sm">Chào mừng trở lại 👋</p>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem' }}>{currentUser.name}</h1>
            <p className="text-indigo-200 text-sm">Học viên · Tham gia từ {currentUser.joinedDate}</p>
          </div>
        </div>
        <p className="text-indigo-100">
          Bạn đã hoàn thành <strong>{completedCount}</strong> khóa học và đang tiến hành <strong>{inProgressCount}</strong> khóa học khác.
          Hãy tiếp tục cố gắng! 💪
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Khóa học đang học', value: inProgressCount, icon: <BookOpen className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Đã hoàn thành', value: completedCount, icon: <CheckCircle className="w-6 h-6 text-green-500" />, bg: 'bg-green-50' },
          { label: 'Chứng chỉ nhận được', value: userEnrollments.filter(e => e.completed && e.grade && e.grade >= 70).length, icon: <Award className="w-6 h-6 text-yellow-500" />, bg: 'bg-yellow-50' },
          { label: 'Giờ học tuần này', value: `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`, icon: <Clock className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.75rem' }} className="text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontWeight: 700 }} className="text-gray-900">Hoạt Động Học Tập</h3>
              <p className="text-gray-400 text-sm">Thời gian học trong tuần này</p>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-lg">
              <span style={{ fontWeight: 700 }} className="text-indigo-600">{totalStudyMinutes} phút</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(v: number) => [`${v} phút`, 'Thời gian học']}
              />
              <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={2} fill="url(#colorMinutes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700 }} className="text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" /> Thông Báo
            </h3>
            {unreadNotifs.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                {unreadNotifs.length} mới
              </span>
            )}
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 4).map(n => (
              <button
                key={n.id}
                onClick={() => {
                  void markNotificationRead(n.id);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  !n.read ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-800" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }} className="text-gray-900">Khóa Học Của Tôi</h3>
            <Link to="/courses" className="text-indigo-600 text-sm hover:text-indigo-700" style={{ fontWeight: 600 }}>
              Khám phá thêm →
            </Link>
          </div>
          <div className="flex gap-2">
            {(['all', 'inProgress', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{ fontWeight: activeTab === tab ? 600 : 400 }}
              >
                {tab === 'all' ? `Tất cả (${userEnrollments.length})` : tab === 'inProgress' ? `Đang học (${inProgressCount})` : `Hoàn thành (${completedCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Chưa có khóa học nào</p>
              <Link to="/courses" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700" style={{ fontWeight: 600 }}>
                Khám phá khóa học
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map(course => {
                if (!course) return null;
                const enrollment = userEnrollments.find(e => e.courseId === course.id);
                const progress = getProgress(course.id);
                const allLessons = course.chapters.flatMap(ch => ch.lessons).length;
                return (
                  <div key={course.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <img src={course.thumbnail} alt={course.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 style={{ fontWeight: 600 }} className="text-gray-900 text-sm line-clamp-1">{course.title}</h4>
                        {enrollment?.completed && enrollment?.grade && enrollment.grade >= 70 ? (
                          <span className="flex-shrink-0 flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>
                            <Trophy className="w-3 h-3" /> Hoàn thành
                          </span>
                        ) : progress === 100 ? (
                          <span className="flex-shrink-0 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs" style={{ fontWeight: 600 }}>
                            <Clock className="w-3 h-3" /> Chờ chấm điểm
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {enrollment?.completedLessons.length || 0}/{allLessons} bài
                        </span>
                        <span style={{ fontWeight: 600 }} className="text-xs text-indigo-600 flex-shrink-0">{progress}%</span>
                      </div>
                      {enrollment?.grade && (
                        <p className="text-xs text-gray-500 mt-1">
                          Điểm: <span style={{ fontWeight: 600 }} className="text-green-600">{enrollment.grade}/100</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {enrollment?.completed && enrollment?.grade && enrollment.grade >= 70 ? (
                        <Link
                          to={`/certificate/${course.id}`}
                          className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs hover:bg-yellow-200 transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          <Award className="w-3.5 h-3.5" />
                          Chứng chỉ
                        </Link>
                      ) : enrollment?.completed && enrollment?.grade && enrollment.grade > 0 && enrollment.grade < 70 ? (
                        <span
                          className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs"
                          style={{ fontWeight: 600 }}
                        >
                          Chưa đạt ({enrollment.grade}/70)
                        </span>
                      ) : progress === 100 ? (
                        <span
                          className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs"
                          style={{ fontWeight: 600 }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Chờ chấm điểm
                        </span>
                      ) : (
                        <Link
                          to={`/learn/${course.id}`}
                          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700 transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          <Play className="w-3.5 h-3.5" />
                          Học tiếp
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
