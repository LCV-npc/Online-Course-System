import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../lib/api';
import {
  BookOpen, Users, Award, DollarSign, TrendingUp, Star,
  ChevronRight, Eye, Edit, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const categoryColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AdminDashboard() {
  const { allCourses, allInstructors, enrollments } = useApp();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch<any>('/api/admin/stats', { auth: true });
        setStats(data);
      } catch {
        // use fallback if fails
      }
    }
    void loadStats();
  }, []);

  const totalRevenue = stats?.estimatedRevenue ?? 0;
  const totalStudentsStr = stats?.studentCount?.toLocaleString() ?? '0';
  const completedEnrollments = stats?.completedCount ?? 0;

  const categoryData = stats?.byCategory ?? [];
  const monthlyData = stats?.monthlyData ?? [];

  const topCourses = [...allCourses].sort((a, b) => b.totalStudents - a.totalStudents).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng khóa học',
            value: stats?.courseCount ?? allCourses.length,
            change: '+12%',
            icon: <BookOpen className="w-6 h-6 text-blue-500" />,
            bg: 'bg-blue-50',
          },
          {
            label: 'Tổng học viên',
            value: totalStudentsStr,
            change: '+8%',
            icon: <Users className="w-6 h-6 text-green-500" />,
            bg: 'bg-green-50',
          },
          {
            label: 'Chứng chỉ đã cấp',
            value: completedEnrollments,
            change: '+15%',
            icon: <Award className="w-6 h-6 text-yellow-500" />,
            bg: 'bg-yellow-50',
          },
          {
            label: 'Doanh thu ước tính',
            value: totalRevenue > 0 ? `${(totalRevenue / 1000000000).toFixed(1)}B ₫` : '0 ₫',
            change: '+22%',
            icon: <DollarSign className="w-6 h-6 text-purple-500" />,
            bg: 'bg-purple-50',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.5rem' }} className="text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600 text-xs" style={{ fontWeight: 600 }}>{stat.change} so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontWeight: 700 }} className="text-gray-900">Đăng Ký & Doanh Thu</h3>
              <p className="text-gray-400 text-sm">6 tháng gần nhất</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} yAxisId="left" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar yAxisId="left" dataKey="enrollments" name="Đăng ký" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Doanh thu" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-5">Phân Bổ Danh Mục</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="courses"
              >
                {categoryData.map((_: any, idx: number) => (
                  <Cell key={idx} fill={categoryColors[idx % categoryColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} khóa`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categoryData.map((cat: any, i: number) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                <span className="text-xs text-gray-600 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700 }} className="text-gray-900">Khóa Học Phổ Biến Nhất</h3>
            <Link to="/admin/courses" className="text-indigo-600 text-sm hover:text-indigo-700" style={{ fontWeight: 600 }}>
              Xem tất cả <ChevronRight className="w-4 h-4 inline" />
            </Link>
          </div>
          <div className="space-y-3">
            {topCourses.map((course, i) => (
              <div key={course.id} className="flex items-center gap-3">
                <span style={{ fontWeight: 700 }} className="text-gray-300 w-5 text-sm">#{i + 1}</span>
                <img src={course.thumbnail} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 500 }}>{course.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{course.rating}</span>
                    <span>{course.totalStudents.toLocaleString()} học viên</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700 }} className="text-indigo-600 text-sm flex-shrink-0">
                  {((course.discountPrice ?? course.price) / 1000).toFixed(0)}K
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructors */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700 }} className="text-gray-900">Giảng Viên</h3>
            <Link to="/admin/instructors" className="text-indigo-600 text-sm hover:text-indigo-700" style={{ fontWeight: 600 }}>
              Quản lý <ChevronRight className="w-4 h-4 inline" />
            </Link>
          </div>
          <div className="space-y-3">
            {allInstructors.slice(0, 5).map(ins => (
              <div key={ins.id} className="flex items-center gap-3">
                <img src={ins.avatar} alt={ins.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{ins.name}</p>
                  <p className="text-xs text-gray-400">{ins.specialty.split(',')[0]}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 justify-end">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs" style={{ fontWeight: 600 }}>{ins.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400">{ins.students.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
