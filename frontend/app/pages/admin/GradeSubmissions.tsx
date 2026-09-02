import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../lib/api';
import { Save, Search, GraduationCap } from 'lucide-react';

type Submission = {
  id: string;
  userId: string;
  userName: string;
  avatar: string | null;
  courseId: string;
  lessonId: string;
  content: string | null;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
  courseTitle: string;
};

export default function GradeSubmissions() {
  const { allCourses } = useApp();
  const [courseId, setCourseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const courseOptions = useMemo(() => {
    return [{ id: '', title: 'Tất cả khóa học' }, ...allCourses.map((c) => ({ id: c.id, title: c.title }))];
  }, [allCourses]);

  const load = async () => {
    setLoading(true);
    try {
      const url = courseId ? `/api/admin/submissions?courseId=${encodeURIComponent(courseId)}` : '/api/admin/submissions';
      const data = await apiFetch<Submission[]>(url, { auth: true });
      setSubmissions(data);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const [scoreDraft, setScoreDraft] = useState<Record<string, string>>({});
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});

  const saveFor = async (sub: Submission) => {
    try {
      const scoreRaw = scoreDraft[sub.id];
      const feedback = feedbackDraft[sub.id];
      const score = scoreRaw === undefined || scoreRaw === '' ? null : Number(scoreRaw);

      await apiFetch(`/api/admin/submissions/${encodeURIComponent(sub.id)}`, {
        auth: true,
        method: 'PATCH',
        body: JSON.stringify({
          score: score ?? undefined,
          feedback: (feedback ?? '').trim() || undefined,
        }),
      } as any);

      // Reload so UI is consistent with DB keys and data
      await load();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }} className="text-gray-900">
            Chấm điểm & Phản hồi
          </h2>
          <p className="text-gray-500 text-sm">{submissions.length} bài nộp</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {courseOptions.map((o) => (
                <option key={o.id || 'all'} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            style={{ fontWeight: 700 }}
            disabled={loading}
          >
            <GraduationCap className="w-4 h-4" />
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Học viên
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Khóa học
                </th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Bài học
                </th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Điểm
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Phản hồi
                </th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar || ''}
                        alt={s.userName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-gray-100"
                      />
                      <div>
                        <p style={{ fontWeight: 700 }} className="text-sm text-gray-900">
                          {s.userName}
                        </p>
                        <p className="text-xs text-gray-400">{s.submittedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                      {s.courseTitle}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      {s.lessonId}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={s.score ?? ''}
                      onChange={(e) => setScoreDraft((p) => ({ ...p, [s.id]: e.target.value }))}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      defaultValue={s.feedback ?? ''}
                      onChange={(e) => setFeedbackDraft((p) => ({ ...p, [s.id]: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Ghi phản hồi..."
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => void saveFor(s)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      style={{ fontWeight: 700 }}
                    >
                      <Save className="w-4 h-4" />
                      Lưu
                    </button>
                    <div className="mt-2 text-xs text-gray-400" style={{ fontWeight: 600 }}>
                      {s.gradedAt ? `Đã chấm: ${s.gradedAt}` : 'Chưa chấm'}
                    </div>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-400">
                    Chưa có bài nộp nào
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

