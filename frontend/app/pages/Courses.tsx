import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { CourseCard } from '../components/CourseCard';
import { categories } from '../data/mockData';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

type SortOption = 'popular' | 'rating' | 'newest' | 'price-asc' | 'price-desc';
type Level = 'Tất cả' | 'Cơ bản' | 'Trung cấp' | 'Nâng cao';

export default function Courses() {
  const { allCourses } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Tất cả');
  const [selectedLevel, setSelectedLevel] = useState<Level>('Tất cả');
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'popular');
  const [minRating, setMinRating] = useState(0);

  const maxPrice = useMemo(() => {
    if (allCourses.length === 0) return 2000000;
    const maxP = Math.max(...allCourses.map(c => c.discountPrice ?? c.price ?? 0));
    return Math.max(2000000, Math.ceil(maxP / 100000) * 100000);
  }, [allCourses]);

  const [priceMaxFilter, setPriceMaxFilter] = useState<number | null>(null);
  const currentMaxPriceFilter = priceMaxFilter ?? maxPrice;
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q) setSearch(q);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...allCourses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'Tất cả') {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (selectedLevel !== 'Tất cả') {
      result = result.filter(c => c.level === selectedLevel);
    }

    result = result.filter(c => {
      const price = c.discountPrice ?? c.price ?? 0;
      return price <= currentMaxPriceFilter;
    });

    if (minRating > 0) {
      result = result.filter(c => c.rating >= minRating);
    }

    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.totalStudents - a.totalStudents); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); break;
      case 'price-asc': result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)); break;
      case 'price-desc': result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)); break;
    }

    return result;
  }, [allCourses, search, selectedCategory, selectedLevel, sortBy, currentMaxPriceFilter, minRating]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('Tất cả');
    setSelectedLevel('Tất cả');
    setSortBy('popular');
    setPriceMaxFilter(null);
    setMinRating(0);
    setSearchParams({});
  };

  const hasActiveFilters = search || selectedCategory !== 'Tất cả' || selectedLevel !== 'Tất cả' || minRating > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '2rem' }}>
          {search ? `Kết quả cho "${search}"` : 'Tất Cả Khóa Học'}
        </h1>
        <p className="text-gray-500">Tìm thấy <span style={{ fontWeight: 600 }} className="text-indigo-600">{filtered.length}</span> khóa học</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700 }} className="text-gray-900">Bộ lọc</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-700">
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <p style={{ fontWeight: 600 }} className="text-gray-700 mb-3 text-sm">Danh mục</p>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ fontWeight: selectedCategory === cat ? 600 : 400 }}
                  >
                    {cat}
                    <span className="float-right text-xs text-gray-400">
                      {cat === 'Tất cả' ? allCourses.length : allCourses.filter(c => c.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="mb-6">
              <p style={{ fontWeight: 600 }} className="text-gray-700 mb-3 text-sm">Cấp độ</p>
              <div className="space-y-1">
                {(['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'] as Level[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLevel === level
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ fontWeight: selectedLevel === level ? 600 : 400 }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p style={{ fontWeight: 600 }} className="text-gray-700 mb-3 text-sm">Đánh giá tối thiểu</p>
              <div className="space-y-1">
                {[0, 3, 3.5, 4, 4.5].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      minRating === r ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ fontWeight: minRating === r ? 600 : 400 }}
                  >
                    {r === 0 ? 'Tất cả' : `⭐ ${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p style={{ fontWeight: 600 }} className="text-gray-700 mb-3 text-sm">Giá tối đa</p>
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={100000}
                value={currentMaxPriceFilter}
                onChange={e => setPriceMaxFilter(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0đ</span>
                <span style={{ fontWeight: 600 }} className="text-indigo-600">
                  {currentMaxPriceFilter.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-indigo-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Lọc
              </button>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ fontWeight: 600 }} className="text-sm text-gray-700 mb-2">Danh mục</p>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ fontWeight: 600 }} className="text-sm text-gray-700 mb-2">Cấp độ</p>
                  <select
                    value={selectedLevel}
                    onChange={e => setSelectedLevel(e.target.value as Level)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  "{search}"
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== 'Tất cả' && (
                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Tất cả')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLevel !== 'Tất cả' && (
                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {selectedLevel}
                  <button onClick={() => setSelectedLevel('Tất cả')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Course Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 style={{ fontWeight: 600 }} className="text-gray-600 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-400 text-sm mb-4">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
                style={{ fontWeight: 600 }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
