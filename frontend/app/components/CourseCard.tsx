import React from 'react';
import { Link } from 'react-router';
import { Star, Clock, Users, BookOpen, ShoppingCart, CheckCircle } from 'lucide-react';
import { Course, formatPrice } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
}

export function CourseCard({ course, showProgress }: CourseCardProps) {
  const { allInstructors, addToCart, isInCart, isEnrolled, getProgress } = useApp();
  const instructor = allInstructors.find(item => item.id === course.instructorId);
  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);
  const progress = enrolled ? getProgress(course.id) : 0;

  const levelColor = {
    'Cơ bản': 'bg-green-100 text-green-700',
    'Trung cấp': 'bg-yellow-100 text-yellow-700',
    'Nâng cao': 'bg-red-100 text-red-700',
  }[course.level];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col">
      <Link to={`/courses/${course.id}`} className="relative overflow-hidden block">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-lg text-xs ${levelColor}`} style={{ fontWeight: 600 }}>
            {course.level}
          </span>
        </div>
        {course.discountPrice && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs" style={{ fontWeight: 700 }}>
            -{Math.round((1 - course.discountPrice / course.price) * 100)}%
          </div>
        )}
        {enrolled && (
          <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs" style={{ fontWeight: 600 }}>
              Đã đăng ký
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>
            {course.category}
          </span>
        </div>

        <Link to={`/courses/${course.id}`}>
          <h3 className="text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {course.title}
          </h3>
        </Link>

        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.shortDesc}</p>

        {instructor && (
          <div className="flex items-center gap-2 mb-3">
            <img src={instructor.avatar} alt={instructor.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="text-xs text-gray-500">{instructor.name}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span style={{ fontWeight: 600 }} className="text-gray-700">{course.rating}</span>
            <span>({course.reviews.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{course.totalStudents.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration}</span>
          </div>
        </div>

        {showProgress && enrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Tiến độ</span>
              <span style={{ fontWeight: 600 }} className="text-indigo-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div>
            {course.discountPrice ? (
              <div>
                <span className="text-gray-400 line-through text-xs">{formatPrice(course.price)}</span>
                <p className="text-indigo-700" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {formatPrice(course.discountPrice)}
                </p>
              </div>
            ) : (
              <p className="text-indigo-700" style={{ fontWeight: 700, fontSize: '1rem' }}>
                {formatPrice(course.price)}
              </p>
            )}
          </div>

          {enrolled ? (
            <Link
              to={`/learn/${course.id}`}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Học tiếp
            </Link>
          ) : inCart ? (
            <Link
              to="/cart"
              className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs hover:bg-green-200 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Trong giỏ
            </Link>
          ) : (
            <button
              onClick={() => addToCart(course.id)}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-100 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Thêm giỏ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
