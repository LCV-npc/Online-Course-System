import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Instructor, categories } from '../../data/mockData';
import { Plus, Edit, Trash2, Search, Star, Users, BookOpen, X, Save, Mail, Award, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const emptyForm: Partial<Instructor> = {
  name: '',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: '',
  specialty: '',
  courses: [],
  rating: 0,
  students: 0,
  experience: '',
};

export default function ManageInstructors() {
  const { allInstructors, allCourses, addInstructor, updateInstructor, deleteInstructor } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [form, setForm] = useState<Partial<Instructor>>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Danh sách category hợp lệ (loại bỏ 'Tất cả')
  const validCategories = useMemo(() => categories.filter(c => c !== 'Tất cả'), []);

  // Hàm map specialty text (vd: "DevOps, Cloud, Docker") sang tên category phù hợp (vd: "DevOps")
  const mapSpecialtyToCategory = (specialty: string): string => {
    if (!specialty) return validCategories[0] || '';
    // Kiểm tra xem specialty có khớp chính xác với category nào không
    const exactMatch = validCategories.find(c => c === specialty);
    if (exactMatch) return exactMatch;
    // Kiểm tra xem specialty có chứa tên category nào không
    const partialMatch = validCategories.find(c =>
      specialty.toLowerCase().includes(c.toLowerCase())
    );
    return partialMatch || validCategories[0] || '';
  };

  const filtered = allInstructors.filter(ins =>
    ins.name.toLowerCase().includes(search.toLowerCase()) ||
    ins.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingInstructor(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (ins: Instructor) => {
    setEditingInstructor(ins);
    // Map specialty sang category name phù hợp
    const mappedSpecialty = mapSpecialtyToCategory(ins.specialty);
    setForm({ ...ins, specialty: mappedSpecialty });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;

    try {
      if (editingInstructor) {
        await apiFetch(`/api/admin/instructors/${editingInstructor.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify(form)
        } as any);
        // Refresh local context state roughly (ideally, we would have a context reload method, 
        // but for now relying on user refresh since mock context doesn't handle remote APIs well 
        // yet without full refactoring. Wait, actually I should update context if possible just to be nice,
        // or just let it update after reload.)
        void updateInstructor({ ...editingInstructor, ...form } as Instructor);
      } else {
        const payload = {
          ...form,
          // Note: form.password should be collected from the UI
        };
        const newIns = await apiFetch(`/api/admin/instructors`, {
          method: 'POST',
          auth: true,
          body: JSON.stringify(payload)
        } as any) as Instructor;

        void addInstructor({ ...newIns, courses: [], rating: 0, students: 0 });
      }
      setShowModal(false);
    } catch (e) {
      alert("Lỗi khi lưu giảng viên");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/instructors/${id}`, { method: 'DELETE', auth: true } as any);
      void deleteInstructor(id);
      setDeleteConfirm(null);
    } catch (e) {
      alert("Lỗi khi xóa");
    }
  };

  const getInstructorCourses = (ins: Instructor) => {
    return allCourses.filter(c => c.instructorId === ins.id);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }} className="text-gray-900">Quản Lý Giảng Viên</h2>
          <p className="text-gray-500 text-sm">Tổng cộng {allInstructors.length} giảng viên</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Thêm Giảng Viên
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm giảng viên..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      {/* Instructor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(ins => {
          const insCourses = getInstructorCourses(ins);
          const isExpanded = expandedId === ins.id;
          return (
            <div key={ins.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <img src={ins.avatar} alt={ins.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-0.5">{ins.name}</h3>
                    <p className="text-indigo-600 text-xs mb-1">{ins.specialty.split(',')[0]}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span style={{ fontWeight: 600 }} className="text-sm">{ins.rating}</span>
                      <span className="text-xs text-gray-400">· {ins.students.toLocaleString()} học viên</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(ins)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ins.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <Mail className="w-3.5 h-3.5" />
                  {ins.email}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />{insCourses.length} khóa học
                  </span>
                  <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
                    <Award className="w-3 h-3" />{ins.experience} kinh nghiệm
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ins.bio}</p>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : ins.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                  style={{ fontWeight: 600 }}
                >
                  {isExpanded ? '▲ Ẩn khóa học' : `▼ ${insCourses.length} khóa học đang dạy`}
                </button>
              </div>

              {/* Expanded Courses */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-3 space-y-2 bg-gray-50">
                  {insCourses.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">Chưa có khóa học</p>
                  ) : insCourses.map(course => (
                    <div key={course.id} className="flex items-center gap-2">
                      <img src={course.thumbnail} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-gray-400">{course.totalStudents.toLocaleString()} học viên</p>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs" style={{ fontWeight: 600 }}>{course.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Không tìm thấy giảng viên nào</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }} className="text-gray-900">
                {editingInstructor ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Avatar Preview */}
              {form.avatar && (
                <div className="flex justify-center mb-2">
                  <img src={form.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100" />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Họ và tên *</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="example@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Mật khẩu đăng nhập {editingInstructor ? '' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={(form as any).password || ''}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value } as any))}
                    placeholder={editingInstructor ? 'Nhập mật khẩu mới (nếu muốn đổi)' : 'Mật khẩu cho giảng viên'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {editingInstructor
                    ? '⚠️ Mật khẩu đã được mã hóa, không thể hiển thị. Để trống nếu KHÔNG muốn đổi mật khẩu.'
                    : '💡 Hãy ghi nhớ mật khẩu này để cung cấp cho giảng viên đăng nhập.'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Chuyên môn (Danh mục)</label>
                <select
                  value={form.specialty || validCategories[0] || ''}
                  onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  {validCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Kinh nghiệm</label>
                <input
                  type="text"
                  value={form.experience || ''}
                  onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                  placeholder="5 năm"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>URL Avatar</label>
                <input
                  type="text"
                  value={form.avatar || ''}
                  onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Giới thiệu</label>
                <textarea
                  value={form.bio || ''}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Giới thiệu về giảng viên..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm"
                style={{ fontWeight: 600 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.email}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm"
                style={{ fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />
                {editingInstructor ? 'Cập nhật' : 'Thêm giảng viên'}
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
            <p className="text-center text-gray-500 text-sm mb-5">Bạn có chắc muốn xóa giảng viên này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm" style={{ fontWeight: 600 }}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm" style={{ fontWeight: 600 }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
