import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { CourseCard } from '../components/CourseCard';
import { categories, formatPrice } from '../data/mockData';
import {
  Search, BookOpen, Award, Users, TrendingUp, Star, ChevronRight,
  Code, Database, Paintbrush, Megaphone, Globe, Server, Briefcase, Languages
} from 'lucide-react';
import { useState } from 'react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Lập trình': <Code className="w-6 h-6" />,
  'Data Science': <Database className="w-6 h-6" />,
  'Thiết kế': <Paintbrush className="w-6 h-6" />,
  'Marketing': <Megaphone className="w-6 h-6" />,
  'DevOps': <Server className="w-6 h-6" />,
  'Ngoại ngữ': <Languages className="w-6 h-6" />,
  'Quản lý': <Briefcase className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  'Lập trình': 'bg-blue-50 text-blue-600',
  'Data Science': 'bg-purple-50 text-purple-600',
  'Thiết kế': 'bg-pink-50 text-pink-600',
  'Marketing': 'bg-orange-50 text-orange-600',
  'DevOps': 'bg-teal-50 text-teal-600',
  'Ngoại ngữ': 'bg-green-50 text-green-600',
  'Quản lý': 'bg-indigo-50 text-indigo-600',
};

export default function Home() {
  const { allCourses, allInstructors } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const featuredCourses = allCourses.filter(c => c.rating >= 4.7).slice(0, 8);
  const popularCourses = [...allCourses].sort((a, b) => b.totalStudents - a.totalStudents).slice(0, 4);
  const topInstructors = allInstructors.slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const stats = [
    { label: 'Khóa học', value: '', icon: <BookOpen className="w-6 h-6 text-indigo-500" /> },
    { label: 'Học viên', value: '', icon: <Users className="w-6 h-6 text-green-500" /> },
    { label: 'Giảng viên', value: '', icon: <Star className="w-6 h-6 text-yellow-500" /> },
    { label: 'Chứng chỉ cấp', value: '', icon: <Award className="w-6 h-6 text-purple-500" /> },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1762330917056-e69b34329ddf?w=1400&h=600&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-indigo-300" />
              <span className="text-indigo-200 text-sm">Nền tảng học trực tuyến #1 Việt Nam</span>
            </div>
            <h1 className="text-white mb-6" style={{ fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.2 }}>
              Học Không Giới Hạn,
              <br />
              <span className="text-indigo-300">Thành Công Không Ngừng</span>
            </h1>
            <p className="text-indigo-200 mb-8 text-lg">
              Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu.
              Học theo tốc độ của bạn, nhận chứng chỉ được công nhận toàn quốc.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm khóa học bạn muốn..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-4 rounded-xl transition-colors flex-shrink-0"
                style={{ fontWeight: 600 }}
              >
                Tìm kiếm
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-indigo-300 text-sm">Phổ biến:</span>
              {['React', 'Python', 'UI/UX', 'Machine Learning', 'SQL'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/courses?q=${tag}`)}
                  className="text-indigo-200 hover:text-white text-sm bg-indigo-700/40 hover:bg-indigo-600/40 px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.5rem' }}>{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.75rem' }}>Danh Mục Khóa Học</h2>
              <p className="text-gray-500">Khám phá lĩnh vực bạn quan tâm</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.filter(c => c !== 'Tất cả').map(cat => (
              <Link
                key={cat}
                to={`/courses?category=${encodeURIComponent(cat)}`}
                className={`${categoryColors[cat] || 'bg-gray-50 text-gray-600'} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 hover:scale-105`}
              >
                {categoryIcons[cat] || <Globe className="w-6 h-6" />}
                <span className="text-sm text-center" style={{ fontWeight: 600 }}>{cat}</span>
                <span className="text-xs opacity-70">
                  {allCourses.filter(c => c.category === cat).length} khóa
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.75rem' }}>Khóa Học Nổi Bật</h2>
              <p className="text-gray-500">Được đánh giá cao nhất bởi học viên</p>
            </div>
            <Link to="/courses" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm" style={{ fontWeight: 600 }}>
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.75rem' }}>Phổ Biến Nhất</h2>
              <p className="text-gray-500">Khóa học có nhiều học viên đăng ký nhất</p>
            </div>
            <Link to="/courses?sort=popular" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm" style={{ fontWeight: 600 }}>
              Xem thêm <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {popularCourses.map((course, index) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-white rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-indigo-600" style={{ fontWeight: 800, fontSize: '1.1rem' }}>#{index + 1}</span>
                </div>
                <img src={course.thumbnail} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{course.title}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span style={{ fontWeight: 600 }} className="text-sm">{course.rating}</span>
                    <span className="text-gray-400 text-xs">({course.totalStudents.toLocaleString()} học viên)</span>
                  </div>
                  <p style={{ fontWeight: 700 }} className="text-indigo-600">
                    {course.discountPrice ? formatPrice(course.discountPrice) : formatPrice(course.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.75rem' }}>Giảng Viên Xuất Sắc</h2>
            <p className="text-gray-500">Học từ những chuyên gia hàng đầu trong ngành</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {topInstructors.map(ins => (
              <div key={ins.id} className="text-center p-6 rounded-2xl hover:shadow-md transition-all group">
                <div className="relative inline-block mb-4">
                  <img src={ins.avatar} alt={ins.name} className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-indigo-100 group-hover:ring-indigo-300 transition-all" />
                </div>
                <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-1">{ins.name}</h3>
                <p className="text-indigo-600 text-sm mb-2">{ins.specialty.split(',')[0]}</p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span style={{ fontWeight: 600 }} className="text-sm">{ins.rating}</span>
                </div>
                <p className="text-gray-500 text-xs">{ins.students.toLocaleString()} học viên</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Award className="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h2 className="text-white mb-4" style={{ fontWeight: 700, fontSize: '2rem' }}>
            Nhận Chứng Chỉ Được Công Nhận
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Hoàn thành khóa học và nhận chứng chỉ điện tử được công nhận bởi hàng trăm doanh nghiệp Việt Nam và quốc tế.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors"
            style={{ fontWeight: 700 }}
          >
            <BookOpen className="w-5 h-5" />
            Bắt đầu học ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
