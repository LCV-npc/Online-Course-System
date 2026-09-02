import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, BookOpen, Award, CheckCircle, TrendingUp, Edit, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../../lib/api';

type StudentReport = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  enrolledCourses: number;
  completedCourses: number;
  totalTime: string;
};

export default function ManageStudents() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [editModal, setEditModal] = useState<StudentReport | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStudents = () => {
    apiFetch<StudentReport[]>('/api/admin/students-report', { auth: true })
      .then((data) => setStudents(data))
      .catch(() => setStudents([]));
  };

  useEffect(() => { loadStudents(); }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      if (filter === 'active') return matchSearch && s.completedCourses < s.enrolledCourses;
      if (filter === 'completed') return matchSearch && s.completedCourses > 0;
      return matchSearch;
    });
  }, [filter, search, students]);

  const totalEnrollments = useMemo(() => students.reduce((s, u) => s + u.enrolledCourses, 0), [students]);
  const totalCompleted = useMemo(() => students.reduce((s, u) => s + u.completedCourses, 0), [students]);

  const openEdit = (student: StudentReport) => {
    setEditModal(student);
    setEditForm({ name: student.name, email: student.email, password: '' });
    setShowPassword(false);
  };

  const handleSave = async () => {
    if (!editModal || !editForm.name.trim() || !editForm.email.trim()) return;
    setSaving(true);
    try {
      const body: any = { name: editForm.name.trim(), email: editForm.email.trim() };
      if (editForm.password.trim()) body.password = editForm.password.trim();
      await apiFetch(`/api/admin/students/${editModal.id}`, {
        auth: true,
        method: 'PUT',
        body: JSON.stringify(body),
      } as any);
      setEditModal(null);
      loadStudents();
    } catch (e) {
      alert('Lỗi khi cập nhật học viên');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/students/${id}`, { auth: true, method: 'DELETE' } as any);
      setDeleteConfirm(null);
      loadStudents();
    } catch {
      alert('Lỗi khi xóa học viên');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }} className="text-gray-900">Quản Lý Học Viên</h2>
          <p className="text-gray-500 text-sm">{students.length} học viên đã đăng ký</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng học viên', value: students.length, icon: <Users className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Đang học tích cực', value: students.filter((s) => s.enrolledCourses > 0).length, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
          { label: 'Tổng lượt đăng ký', value: totalEnrollments, icon: <BookOpen className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Chứng chỉ đã cấp', value: totalCompleted, icon: <Award className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>{s.icon}</div>
            <p style={{ fontWeight: 800, fontSize: '1.5rem' }} className="text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm học viên..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {([
            { v: 'all', l: 'Tất cả' },
            { v: 'active', l: 'Đang học' },
            { v: 'completed', l: 'Có chứng chỉ' },
          ] as const).map(btn => (
            <button
              key={btn.v}
              onClick={() => setFilter(btn.v)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                filter === btn.v ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
              style={{ fontWeight: filter === btn.v ? 600 : 400 }}
            >
              {btn.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Học viên</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Khóa học</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Đã hoàn thành</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Tổng giờ học</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Tham gia</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Trạng thái</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <p style={{ fontWeight: 600 }} className="text-sm text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span style={{ fontWeight: 700 }} className="text-gray-900">{student.enrolledCourses}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {student.completedCourses > 0 && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span style={{ fontWeight: 600 }} className={student.completedCourses > 0 ? 'text-green-600' : 'text-gray-400'}>
                        {student.completedCourses}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-gray-700">{student.totalTime}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-500">{student.joinedDate}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      student.completedCourses >= student.enrolledCourses && student.enrolledCourses > 0
                        ? 'bg-green-100 text-green-700'
                        : student.enrolledCourses > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`} style={{ fontWeight: 600 }}>
                      {student.completedCourses >= student.enrolledCourses && student.enrolledCourses > 0
                        ? 'Xuất sắc'
                        : student.enrolledCourses > 0
                        ? 'Đang học'
                        : 'Mới'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(student)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(student.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Không tìm thấy học viên nào</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }} className="text-gray-900">Chỉnh sửa học viên</h3>
              <button onClick={() => setEditModal(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <img src={editModal.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100" />
                <div>
                  <p style={{ fontWeight: 600 }} className="text-gray-900">{editModal.name}</p>
                  <p className="text-xs text-gray-400">ID: {editModal.id}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Họ tên *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Mật khẩu mới (để trống nếu không đổi)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
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
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setEditModal(null)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm"
                style={{ fontWeight: 600 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editForm.name.trim() || !editForm.email.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm"
                style={{ fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
            <p className="text-center text-gray-500 text-sm mb-5">
              Bạn có chắc muốn xóa học viên này? Tất cả dữ liệu đăng ký khóa học của học viên cũng sẽ bị xóa. Hành động này không thể hoàn tác.
            </p>
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
