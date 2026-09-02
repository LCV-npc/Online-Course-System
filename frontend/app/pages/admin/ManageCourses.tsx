import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Chapter, Course, Lesson, QuizQuestion, categories, formatPrice } from '../../data/mockData';
import {
  Plus, Edit, Trash2, Search, Star, Users, BookOpen,
  X, Save, Eye, Filter, ChevronDown
} from 'lucide-react';

type SortKey = 'title' | 'students' | 'rating' | 'price';

const emptyForm: Partial<Course> = {
  title: '',
  shortDesc: '',
  description: '',
  category: 'Lập trình',
  level: 'Cơ bản',
  price: 0,
  duration: '',
  totalLessons: 0,
  language: 'Tiếng Việt',
  tags: [],
  certificate: true,
  chapters: [],
  reviews: [],
  requirements: [],
  objectives: [],
  thumbnail: 'https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?w=600&h=340&fit=crop',
  lastUpdated: new Date().toISOString().split('T')[0],
};

const lessonTypes: Lesson['type'][] = ['video', 'quiz', 'document', 'exercise'];

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneChapters(chapters: Chapter[] = []): Chapter[] {
  return chapters.map((chapter) => ({
    ...chapter,
    lessons: (chapter.lessons || []).map((lesson) => ({ ...lesson })),
  }));
}

function createEmptyLesson(): Lesson {
  return {
    id: createId('l'),
    title: '',
    type: 'video',
    duration: '',
    description: '',
  };
}

function createEmptyChapter(): Chapter {
  return {
    id: createId('ch'),
    title: '',
    lessons: [],
  };
}

export default function ManageCourses() {
  const { allCourses, allInstructors, addCourse, updateCourse, deleteCourse } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [sortBy, setSortBy] = useState<SortKey>('students');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Partial<Course>>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [chaptersDraft, setChaptersDraft] = useState<Chapter[]>([]);
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const totalLessonsInDraft = chaptersDraft.reduce((sum, chapter) => sum + chapter.lessons.length, 0);

  const filtered = allCourses
    .filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'Tất cả' || c.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'students': return b.totalStudents - a.totalStudents;
        case 'rating': return b.rating - a.rating;
        case 'price': return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
        default: return 0;
      }
    });

  const openAdd = () => {
    setEditingCourse(null);
    setForm({ ...emptyForm, instructorId: allInstructors[0]?.id });
    setChaptersDraft(cloneChapters(emptyForm.chapters || []));
    setChaptersError(null);
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ ...course });
    setChaptersDraft(cloneChapters(course.chapters || []));
    setChaptersError(null);
    setShowModal(true);
  };

  const addChapter = () => {
    setChaptersDraft((prev) => [...prev, createEmptyChapter()]);
    setChaptersError(null);
  };

  const removeChapter = (chapterId: string) => {
    setChaptersDraft((prev) => prev.filter((chapter) => chapter.id !== chapterId));
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChaptersDraft((prev) =>
      prev.map((chapter) => (chapter.id === chapterId ? { ...chapter, title } : chapter)),
    );
    setChaptersError(null);
  };

  const addLesson = (chapterId: string) => {
    setChaptersDraft((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, lessons: [...chapter.lessons, createEmptyLesson()] }
          : chapter,
      ),
    );
    setChaptersError(null);
  };

  const removeLesson = (chapterId: string, lessonId: string) => {
    setChaptersDraft((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, lessons: chapter.lessons.filter((lesson) => lesson.id !== lessonId) }
          : chapter,
      ),
    );
  };

  const updateLesson = <K extends keyof Lesson>(chapterId: string, lessonId: string, key: K, value: Lesson[K]) => {
    setChaptersDraft((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
            ...chapter,
            lessons: chapter.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, [key]: value } : lesson,
            ),
          }
          : chapter,
      ),
    );
    setChaptersError(null);
  };

  // Quiz helpers
  const addQuestion = (chapterId: string, lessonId: string) => {
    setChaptersDraft(prev => prev.map(ch => ch.id === chapterId ? {
      ...ch, lessons: ch.lessons.map(l => l.id === lessonId ? {
        ...l, questions: [...(l.questions || []), { id: createId('q'), questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]
      } : l)
    } : ch));
  };

  const removeQuestion = (chapterId: string, lessonId: string, questionId: string) => {
    setChaptersDraft(prev => prev.map(ch => ch.id === chapterId ? {
      ...ch, lessons: ch.lessons.map(l => l.id === lessonId ? {
        ...l, questions: (l.questions || []).filter(q => q.id !== questionId)
      } : l)
    } : ch));
  };

  const updateQuestion = (chapterId: string, lessonId: string, questionId: string, field: string, value: any) => {
    setChaptersDraft(prev => prev.map(ch => ch.id === chapterId ? {
      ...ch, lessons: ch.lessons.map(l => l.id === lessonId ? {
        ...l, questions: (l.questions || []).map(q => q.id === questionId ? { ...q, [field]: value } : q)
      } : l)
    } : ch));
  };

  const updateQuestionOption = (chapterId: string, lessonId: string, questionId: string, optIndex: number, value: string) => {
    setChaptersDraft(prev => prev.map(ch => ch.id === chapterId ? {
      ...ch, lessons: ch.lessons.map(l => l.id === lessonId ? {
        ...l, questions: (l.questions || []).map(q => q.id === questionId ? { ...q, options: q.options.map((o, i) => i === optIndex ? value : o) } : q)
      } : l)
    } : ch));
  };

  const handleSave = () => {
    if (!form.title || !form.instructorId) return;
    try {
      const chaptersParsed = chaptersDraft.map((chapter, chapterIndex) => {
        const title = chapter.title.trim();
        if (!title) {
          throw new Error(`Chương ${chapterIndex + 1} chưa có tiêu đề`);
        }
        const lessons = chapter.lessons.map((lesson, lessonIndex) => {
          const lessonTitle = lesson.title.trim();
          if (!lessonTitle) {
            throw new Error(`Bài học ${lessonIndex + 1} của chương ${chapterIndex + 1} chưa có tiêu đề`);
          }
          const base: any = {
            id: lesson.id || createId('l'),
            title: lessonTitle,
            type: lesson.type || 'video',
            duration: lesson.duration || '',
            description: lesson.description || '',
          };
          if (lesson.type === 'video' && (lesson as any).videoUrl) base.videoUrl = (lesson as any).videoUrl;
          if (lesson.type === 'document' && (lesson as any).documentContent) base.documentContent = (lesson as any).documentContent;
          if (lesson.type === 'exercise' && (lesson as any).exercisePrompt) base.exercisePrompt = (lesson as any).exercisePrompt;
          if (lesson.type === 'quiz' && lesson.questions && lesson.questions.length > 0) base.questions = lesson.questions;
          return base;
        });
        return {
          id: chapter.id || createId('ch'),
          title,
          lessons,
        };
      });

      if (chaptersParsed.length === 0) {
        setChaptersError('Vui lòng thêm ít nhất 1 chương');
        return;
      }

      setChaptersError(null);
      const nextTotalLessons = chaptersParsed.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
      if (editingCourse) {
        void updateCourse({ ...editingCourse, ...form, totalLessons: nextTotalLessons, chapters: chaptersParsed } as Course);
      } else {
        void addCourse({
          ...emptyForm,
          ...form,
          id: `c_${Date.now()}`,
          rating: 0,
          totalStudents: 0,
          totalLessons: nextTotalLessons,
          chapters: chaptersParsed,
        } as Course);
      }
      setShowModal(false);
    } catch (error) {
      setChaptersError(error instanceof Error ? error.message : 'Nội dung khóa học không hợp lệ');
    }
  };
  const handleDelete = (id: string) => {
    void deleteCourse(id);
    setDeleteConfirm(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }} className="text-gray-900">Quản Lý Khóa Học</h2>
          <p className="text-gray-500 text-sm">Tổng cộng {allCourses.length} khóa học</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Thêm Khóa Học
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="students">Học viên nhiều nhất</option>
          <option value="rating">Đánh giá cao nhất</option>
          <option value="price">Giá cao nhất</option>
          <option value="title">Tên A-Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Khóa học</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Danh mục</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Đánh giá</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Học viên</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Giá</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(course => {
                const instructor = allInstructors.find(item => item.id === course.instructorId);
                return (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnail} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p style={{ fontWeight: 600 }} className="text-sm text-gray-900 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-gray-400">{instructor?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            course.level === 'Cơ bản' ? 'bg-green-100 text-green-700' :
                            course.level === 'Trung cấp' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`} style={{ fontWeight: 500 }}>{course.level}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">{course.category}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span style={{ fontWeight: 600 }} className="text-sm">{course.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-700">{course.totalStudents.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div>
                        {course.discountPrice && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(course.price)}</p>
                        )}
                        <p style={{ fontWeight: 700 }} className="text-sm text-indigo-700">
                          {formatPrice(course.discountPrice ?? course.price)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(course)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(course.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Không tìm thấy khóa học nào</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }} className="text-gray-900">
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Tên khóa học *</label>
                  <input
                    type="text"
                    value={form.title || ''}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Nhập tên khóa học"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Mô tả ngắn</label>
                  <textarea
                    value={form.shortDesc || ''}
                    onChange={e => setForm(p => ({ ...p, shortDesc: e.target.value }))}
                    rows={2}
                    placeholder="Mô tả ngắn về khóa học"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Danh mục</label>
                  <select
                    value={form.category || 'Lập trình'}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    {categories.filter(c => c !== 'Tất cả').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Cấp độ</label>
                  <select
                    value={form.level || 'Cơ bản'}
                    onChange={e => setForm(p => ({ ...p, level: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option>Cơ bản</option>
                    <option>Trung cấp</option>
                    <option>Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Giảng viên *</label>
                  <select
                    value={form.instructorId || ''}
                    onChange={e => setForm(p => ({ ...p, instructorId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="">Chọn giảng viên</option>
                    {allInstructors.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={form.price || 0}
                    onChange={e => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Giá khuyến mãi (VNĐ)</label>
                  <input
                    type="number"
                    value={form.discountPrice || ''}
                    onChange={e => setForm(p => ({ ...p, discountPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Để trống nếu không có"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Thời lượng</label>
                  <input
                    type="text"
                    value={form.duration || ''}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="VD: 42 giờ"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Số bài giảng</label>
                  <input
                    type="number"
                    value={totalLessonsInDraft}
                    disabled
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-700" style={{ fontWeight: 600 }}>Nội dung khóa học</label>
                    <button
                      type="button"
                      onClick={addChapter}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                      style={{ fontWeight: 600 }}
                    >
                      <Plus className="w-3.5 h-3.5" /> + Thêm chương
                    </button>
                  </div>

                  <div className="space-y-3">
                    {chaptersDraft.map((chapter, chapterIndex) => (
                      <div key={chapter.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                            placeholder={`Tiêu đề chương ${chapterIndex + 1}`}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => addLesson(chapter.id)}
                            className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                            style={{ fontWeight: 600 }}
                          >
                            + Thêm bài học
                          </button>
                          <button
                            type="button"
                            onClick={() => removeChapter(chapter.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Xóa chương"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {chapter.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                                  placeholder={`Bài học ${lessonIndex + 1}`}
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                                <select
                                  value={lesson.type}
                                  onChange={(e) => updateLesson(chapter.id, lesson.id, 'type', e.target.value as Lesson['type'])}
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                                >
                                  {lessonTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={lesson.duration}
                                  onChange={(e) => updateLesson(chapter.id, lesson.id, 'duration', e.target.value)}
                                  placeholder="Thời lượng (VD: 10:00)"
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeLesson(chapter.id, lesson.id)}
                                  className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                  style={{ fontWeight: 600 }}
                                >
                                  Xóa bài học
                                </button>
                                <textarea
                                  value={lesson.description}
                                  onChange={(e) => updateLesson(chapter.id, lesson.id, 'description', e.target.value)}
                                  rows={2}
                                  placeholder="Mô tả bài học"
                                  className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                />

                                {/* === VIDEO: URL Input === */}
                                {lesson.type === 'video' && (
                                  <input
                                    type="text"
                                    value={(lesson as any).videoUrl || ''}
                                    onChange={(e) => updateLesson(chapter.id, lesson.id, 'videoUrl' as any, e.target.value)}
                                    placeholder="URL Video YouTube (VD: https://www.youtube.com/embed/xxxxx)"
                                    className="sm:col-span-2 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
                                  />
                                )}

                                {/* === DOCUMENT: Content textarea === */}
                                {lesson.type === 'document' && (
                                  <textarea
                                    value={(lesson as any).documentContent || ''}
                                    onChange={(e) => updateLesson(chapter.id, lesson.id, 'documentContent' as any, e.target.value)}
                                    rows={5}
                                    placeholder="Nội dung tài liệu (hỗ trợ: # Heading, ## SubHeading, - danh sách, > trích dẫn)"
                                    className="sm:col-span-2 border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-50 resize-none"
                                  />
                                )}

                                {/* === EXERCISE: Prompt textarea === */}
                                {lesson.type === 'exercise' && (
                                  <textarea
                                    value={(lesson as any).exercisePrompt || ''}
                                    onChange={(e) => updateLesson(chapter.id, lesson.id, 'exercisePrompt' as any, e.target.value)}
                                    rows={4}
                                    placeholder="Đề bài tập (hỗ trợ: ## Heading, ### SubHeading, - danh sách)"
                                    className="sm:col-span-2 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50 resize-none"
                                  />
                                )}

                                {/* === QUIZ: Questions editor === */}
                                {lesson.type === 'quiz' && (
                                  <div className="sm:col-span-2 border border-purple-200 rounded-lg p-3 bg-purple-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-purple-700" style={{ fontWeight: 600 }}>Câu hỏi trắc nghiệm ({(lesson.questions || []).length})</span>
                                      <button
                                        type="button"
                                        onClick={() => addQuestion(chapter.id, lesson.id)}
                                        className="px-2 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        style={{ fontWeight: 600 }}
                                      >
                                        + Thêm câu hỏi
                                      </button>
                                    </div>
                                    <div className="space-y-3">
                                      {(lesson.questions || []).map((q, qIdx) => (
                                        <div key={q.id} className="bg-white rounded-lg p-3 border border-purple-100">
                                          <div className="flex items-start gap-2 mb-2">
                                            <span className="text-xs text-purple-500 mt-2" style={{ fontWeight: 700 }}>Câu {qIdx + 1}</span>
                                            <input
                                              type="text"
                                              value={q.questionText}
                                              onChange={(e) => updateQuestion(chapter.id, lesson.id, q.id, 'questionText', e.target.value)}
                                              placeholder="Nội dung câu hỏi"
                                              className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-300"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => removeQuestion(chapter.id, lesson.id, q.id)}
                                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1.5">
                                            {q.options.map((opt, optIdx) => (
                                              <div key={optIdx} className="flex items-center gap-1.5">
                                                <input
                                                  type="radio"
                                                  name={`correct-${q.id}`}
                                                  checked={q.correctAnswerIndex === optIdx}
                                                  onChange={() => updateQuestion(chapter.id, lesson.id, q.id, 'correctAnswerIndex', optIdx)}
                                                  title="Đáp án đúng"
                                                  className="w-3.5 h-3.5 text-green-600"
                                                />
                                                <input
                                                  type="text"
                                                  value={opt}
                                                  onChange={(e) => updateQuestionOption(chapter.id, lesson.id, q.id, optIdx, e.target.value)}
                                                  placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                                                  className={`flex-1 border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 ${
                                                    q.correctAnswerIndex === optIdx ? 'border-green-400 bg-green-50 focus:ring-green-300' : 'border-gray-200 focus:ring-purple-300'
                                                  }`}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                          <p className="text-xs text-gray-400 mt-1">🔘 Chọn radio để đánh dấu đáp án đúng</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {chaptersDraft.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">Chưa có chương nào. Bấm "+ Thêm chương" để bắt đầu.</p>
                  )}
                  {chaptersError && <p className="text-sm text-red-600 mt-2">{chaptersError}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>URL Thumbnail</label>
                  <input
                    type="text"
                    value={form.thumbnail || ''}
                    onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="cert"
                    checked={form.certificate || false}
                    onChange={e => setForm(p => ({ ...p, certificate: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="cert" className="text-sm text-gray-700">Cấp chứng chỉ khi hoàn thành</label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                style={{ fontWeight: 600 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.instructorId}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
                style={{ fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />
                {editingCourse ? 'Cập nhật' : 'Thêm khóa học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 style={{ fontWeight: 700 }} className="text-center text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-center text-gray-500 text-sm mb-5">Bạn có chắc muốn xóa khóa học này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm"
                style={{ fontWeight: 600 }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm"
                style={{ fontWeight: 600 }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
