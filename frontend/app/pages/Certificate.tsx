import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { Award, Download, Share2, ArrowLeft, CheckCircle, Star, Calendar, User } from 'lucide-react';

export default function Certificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const { allCourses, allInstructors, getEnrollment, currentUser } = useApp();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const course = allCourses.find(c => c.id === courseId);
  const enrollment = getEnrollment(courseId || '');
  const instructor = course ? allInstructors.find(item => item.id === course.instructorId) : undefined;

  if (!course || !enrollment?.completed || !enrollment.grade || enrollment.grade < 70) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Award className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 style={{ fontWeight: 700 }} className="text-xl text-gray-700 mb-2">
          {enrollment?.completed && enrollment?.grade && enrollment.grade < 70
            ? 'Chưa đủ điểm nhận chứng chỉ'
            : 'Chưa có chứng chỉ'}
        </h2>
        <p className="text-gray-500 mb-4">
          {enrollment?.completed && enrollment?.grade && enrollment.grade < 70
            ? `Điểm hiện tại: ${enrollment.grade}/100. Cần đạt tối thiểu 70 điểm để nhận chứng chỉ.`
            : 'Hoàn thành khóa học và đạt tối thiểu 70 điểm để nhận chứng chỉ.'}
        </p>
        <Link to={enrollment?.completed ? '/dashboard' : `/learn/${courseId}`} className="text-indigo-600 hover:underline" style={{ fontWeight: 600 }}>
          {enrollment?.completed ? '← Quay lại Dashboard' : 'Tiếp tục học →'}
        </Link>
      </div>
    );
  }

  const certificateYear = enrollment.completedDate
    ? new Date(enrollment.completedDate).getFullYear()
    : new Date().getFullYear();
  const certId = `EDUPRO-${courseId?.toUpperCase()}-${currentUser.id.toUpperCase()}-${certificateYear}`;
  const completedDate = new Date(enrollment.completedDate || '').toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      if (certRef.current) {
        const canvas = await html2canvas(certRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Chungchi_${course.title.replace(/\s+/g, '_')}_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: print
      window.print();
    }
    setDownloading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Chứng chỉ - ${course.title}`,
        text: `Tôi vừa hoàn thành khóa học "${course.title}" trên EduPro!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link chứng chỉ!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại bảng điều khiển
      </Link>

      <div className="text-center mb-8">
        <h1 style={{ fontWeight: 700, fontSize: '1.75rem' }} className="text-gray-900 mb-2">🎓 Chứng Chỉ Hoàn Thành</h1>
        <p className="text-gray-500">Chúc mừng bạn đã hoàn thành khóa học thành công!</p>
      </div>

      {/* Certificate Preview */}
      <div
        ref={certRef}
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl mb-8"
        style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f5f0ff 100%)',
          border: '3px solid #e0e7ff',
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-40 h-40 opacity-10" style={{
          background: 'radial-gradient(circle, #6366f1, transparent)',
        }} />
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10" style={{
          background: 'radial-gradient(circle, #8b5cf6, transparent)',
        }} />

        {/* Border design */}
        <div className="absolute inset-3 rounded-2xl pointer-events-none" style={{
          border: '2px solid #c7d2fe',
        }} />
        <div className="absolute inset-5 rounded-xl pointer-events-none" style={{
          border: '1px solid #e0e7ff',
        }} />

        <div className="relative p-12 text-center">
          {/* Logo & Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p style={{ fontWeight: 800, fontSize: '1.5rem', color: '#4f46e5', letterSpacing: '-0.5px' }}>EduPro</p>
              <p style={{ fontSize: '0.65rem', color: '#818cf8', letterSpacing: '2px' }}>ONLINE LEARNING PLATFORM</p>
            </div>
          </div>

          {/* Certificate Title */}
          <p style={{ fontSize: '0.75rem', letterSpacing: '3px', color: '#6b7280', fontWeight: 600 }} className="mb-2">
            CHỨNG NHẬN HOÀN THÀNH
          </p>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#1e1b4b', letterSpacing: '-0.5px' }} className="mb-6">
            Certificate of Completion
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent to-indigo-300 flex-1 max-w-32" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-indigo-300 fill-indigo-300" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <div className="h-px bg-gradient-to-l from-transparent to-indigo-300 flex-1 max-w-32" />
          </div>

          {/* Recipient */}
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }} className="mb-2">Trân trọng trao tặng chứng chỉ này cho</p>
          <p style={{ fontWeight: 900, fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', color: '#312e81', fontFamily: '"Segoe UI", "Be Vietnam Pro", Arial, sans-serif', unicodeBidi: 'normal' }} className="mb-1">
            {currentUser.name}
          </p>
          <p style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 500 }} className="mb-6">
            {currentUser.email}
          </p>

          <p style={{ color: '#6b7280', fontSize: '0.9rem' }} className="mb-2">đã hoàn thành xuất sắc khóa học</p>
          <p style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: '#1e1b4b' }} className="mb-2 max-w-xl mx-auto">
            {course.title}
          </p>
          <p style={{ color: '#818cf8', fontSize: '0.85rem' }} className="mb-8">
            Danh mục: {course.category} · Cấp độ: {course.level} · Thời lượng: {course.duration}
          </p>

          {/* Score */}
          {enrollment.grade && (
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-full mb-8">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span style={{ fontWeight: 700, color: '#4f46e5' }}>Điểm đạt được: {enrollment.grade}/100</span>
            </div>
          )}

          {/* Signatories */}
          <div className="flex items-end justify-around mt-4">
            {instructor && (
              <div className="text-center">
                <div className="h-px bg-gray-300 w-40 mb-2" />
                <p style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.9rem' }}>{instructor.name}</p>
                <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Giảng viên</p>
              </div>
            )}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <p style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.85rem' }}>Con Dấu Chính Thức</p>
            </div>
            <div className="text-center">
              <div className="h-px bg-gray-300 w-40 mb-2" />
              <p style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.9rem' }}>Nguyễn Minh Quân</p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Giám đốc EduPro</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-indigo-100 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Ngày cấp: {completedDate}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Mã chứng chỉ: <span style={{ fontWeight: 600 }} className="text-indigo-500">{certId}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Xác thực tại: edupro.vn/verify
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-lg"
          style={{ fontWeight: 700 }}
        >
          {downloading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {downloading ? 'Đang tải...' : 'Tải PDF'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-200 px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          style={{ fontWeight: 700 }}
        >
          <Share2 className="w-5 h-5" />
          Chia sẻ
        </button>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          style={{ fontWeight: 600 }}
        >
          Về bảng điều khiển
        </Link>
      </div>

      {/* Course Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Khóa học', value: course.title, icon: <Award className="w-5 h-5 text-indigo-500" /> },
          { label: 'Hoàn thành ngày', value: completedDate, icon: <Calendar className="w-5 h-5 text-green-500" /> },
          { label: 'Điểm số', value: `${enrollment.grade || 'N/A'}/100`, icon: <Star className="w-5 h-5 text-yellow-500" /> },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">{item.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p style={{ fontWeight: 600 }} className="text-gray-900 text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
