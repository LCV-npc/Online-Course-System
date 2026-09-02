import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import {
  Play, CheckCircle, HelpCircle, FileText, Download, ChevronLeft,
  ChevronRight, Menu, X, Award, Clock, BarChart3, BookOpen, AlertCircle, Star, Send
} from 'lucide-react';
import { Lesson, QuizQuestion } from '../data/mockData';
import { apiFetch } from '../lib/api';

/** Convert any YouTube URL to embed format */
function toEmbedUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (!['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be'].includes(host)) {
      return '';
    }
  } catch {
    return '';
  }
  // Already embed format
  if (url.includes('/embed/')) return url;
  // https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

export default function Learn() {
  const { courseId } = useParams<{ courseId: string }>();
  const { allCourses, isEnrolled, completeLesson, getEnrollment, getProgress, completeCourse, logStudyActivity, authLoading } = useApp();
  const navigate = useNavigate();

  const publicCourse = allCourses.find(c => c.id === courseId);
  const enrollment = getEnrollment(courseId || '');
  const enrolled = isEnrolled(courseId || '');
  const [courseContent, setCourseContent] = useState<typeof publicCourse>();
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const course = courseContent || publicCourse;

  const allLessons = course?.chapters.flatMap(ch => ch.lessons) || [];
  const [currentLessonId, setCurrentLessonId] = useState(
    enrollment?.lastAccessedLesson || allLessons[0]?.id || ''
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completionShown, setCompletionShown] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Exercise state
  const [exerciseContent, setExerciseContent] = useState('');
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [exerciseSubmitting, setExerciseSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!courseId || !enrolled) {
      setCourseContent(undefined);
      return;
    }
    setContentLoading(true);
    setContentError('');
    apiFetch<typeof publicCourse>(`/api/enrollments/${encodeURIComponent(courseId)}/content`, { auth: true })
      .then((content) => {
        if (!cancelled && content) setCourseContent(content);
      })
      .catch((error: Error) => {
        if (!cancelled) setContentError(error.message || 'Không thể tải nội dung khóa học');
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, enrolled]);

  useEffect(() => {
    if (!currentLessonId && allLessons.length > 0) {
      setCurrentLessonId(enrollment?.lastAccessedLesson || allLessons[0].id);
    }
  }, [allLessons, currentLessonId, enrollment?.lastAccessedLesson]);

  // Reset quiz/exercise state when lesson changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setExerciseContent('');
    setExerciseSubmitted(false);
    setExerciseSubmitting(false);
  }, [currentLessonId]);

  const currentLesson = allLessons.find(l => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const progress = getProgress(courseId || '');



  // Hook đo thời gian học tập - gọi api cộng 1 phút mỗi 60s
  useEffect(() => {
    if (!currentLessonId || !enrolled) return;
    const interval = setInterval(() => {
      void logStudyActivity(1);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentLessonId, enrolled, logStudyActivity]);

  if (authLoading || (enrolled && contentLoading)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải nội dung khóa học...</div>;
  }

  if (contentError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{contentError}</div>;
  }

  if (!course || !enrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 style={{ fontWeight: 700 }} className="text-xl text-gray-700 mb-2">Bạn chưa đăng ký khóa học này</h2>
          <Link to={`/courses/${courseId}`} className="text-indigo-600 hover:underline">Đăng ký ngay →</Link>
        </div>
      </div>
    );
  }

  const isLessonCompleted = (id: string) => enrollment?.completedLessons.includes(id) || false;

  const handleCompleteLesson = () => {
    if (!courseId || !currentLessonId) return;

    const totalLessons = allLessons.length;
    const prevCompleted = enrollment?.completedLessons || [];
    const nextCompletedLessons = prevCompleted.includes(currentLessonId)
      ? prevCompleted
      : [...prevCompleted, currentLessonId];

    const newProgress = totalLessons ? Math.round((nextCompletedLessons.length / totalLessons) * 100) : 0;

    void completeLesson(courseId, currentLessonId);

    if (newProgress === 100 && !completionShown && !enrollment?.completed) {
      setCompletionShown(true);
    }
  };

  const handleNext = () => {
    const nextLesson = allLessons[currentIndex + 1];
    if (nextLesson) {
      if (!isLessonCompleted(currentLessonId)) handleCompleteLesson();
      setCurrentLessonId(nextLesson.id);
    }
  };

  const handlePrev = () => {
    const prevLesson = allLessons[currentIndex - 1];
    if (prevLesson) setCurrentLessonId(prevLesson.id);
  };



  const handleMarkComplete = () => {
    if (!courseId || !currentLessonId) return;
    const totalLessons = allLessons.length;
    const prevCompleted = enrollment?.completedLessons || [];
    const nextCompletedLessons = prevCompleted.includes(currentLessonId)
      ? prevCompleted
      : [...prevCompleted, currentLessonId];
    const progressAfter = totalLessons ? Math.round((nextCompletedLessons.length / totalLessons) * 100) : progress;

    handleCompleteLesson();

    if (progressAfter >= 100 && !enrollment?.completed) {
      setCompletionShown(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to={`/courses/${courseId}`} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:block">{course.title}</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-400" style={{ fontWeight: 600 }}>{progress}%</span>
          </div>

          {enrollment?.completed && (enrollment.grade ?? 0) >= 70 && (
            <Link
              to={`/certificate/${courseId}`}
              className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Award className="w-4 h-4" />
              Lấy chứng chỉ
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 bg-gray-800 border-r border-gray-700 flex-shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-gray-700">
              <p className="text-white text-sm mb-1" style={{ fontWeight: 600 }}>Nội dung khóa học</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-600 rounded-full">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-gray-400">{enrollment?.completedLessons.length || 0}/{allLessons.length}</span>
              </div>
            </div>

            {course.chapters.map(chapter => (
              <div key={chapter.id}>
                <div className="px-4 py-2 bg-gray-750">
                  <p className="text-gray-300 text-xs" style={{ fontWeight: 700 }}>{chapter.title}</p>
                </div>
                {chapter.lessons.map(lesson => {
                  const completed = isLessonCompleted(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonId(lesson.id)}
                      className={`w-full text-left flex items-start gap-2 px-4 py-2.5 text-xs transition-colors border-l-2 ${
                        isCurrent
                          ? 'bg-indigo-900/40 border-indigo-500 text-white'
                          : 'border-transparent text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : lesson.type === 'video' ? (
                          <Play className="w-4 h-4" />
                        ) : lesson.type === 'quiz' ? (
                          <HelpCircle className="w-4 h-4" />
                        ) : lesson.type === 'exercise' ? (
                          <Download className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{lesson.title}</p>
                        <p className="text-gray-500 text-xs">{lesson.duration}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {currentLesson ? (
            <div>
              {/* Video Area */}
              {currentLesson.type === 'video' && (
                <div className="bg-black relative" style={{ paddingTop: '56.25%' }}>
                  {(currentLesson as any).videoUrl ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={toEmbedUrl((currentLesson as any).videoUrl)}
                      title={currentLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                        <p className="text-white/70 text-sm">Video: {currentLesson.title}</p>
                        <p className="text-white/50 text-xs mt-1">Thời lượng: {currentLesson.duration}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Lesson Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {currentLesson.type === 'video' && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs" style={{ fontWeight: 600 }}>Video</span>}
                      {currentLesson.type === 'quiz' && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs" style={{ fontWeight: 600 }}>Quiz</span>}
                      {currentLesson.type === 'exercise' && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs" style={{ fontWeight: 600 }}>Bài tập</span>}
                      {currentLesson.type === 'document' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs" style={{ fontWeight: 600 }}>Tài liệu</span>}
                      <span className="text-gray-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{currentLesson.duration}</span>
                    </div>
                    <h2 style={{ fontWeight: 700, fontSize: '1.5rem' }} className="text-gray-900">{currentLesson.title}</h2>
                    <p className="text-gray-500 mt-1">{currentLesson.description}</p>
                  </div>
                  {isLessonCompleted(currentLesson.id) && (
                    <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm" style={{ fontWeight: 600 }}>Hoàn thành</span>
                    </div>
                  )}
                </div>

                {/* Document Content */}
                {currentLesson.type === 'document' && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 700 }} className="text-gray-900">📄 Tài liệu: {currentLesson.title}</h3>
                        <p className="text-gray-500 text-sm">Loại bài: Tài liệu đọc</p>
                      </div>
                    </div>
                    {(currentLesson as any).documentContent ? (
                      <div className="prose prose-sm max-w-none bg-gray-50 rounded-xl p-5 border border-gray-200">
                        {((currentLesson as any).documentContent as string).split('\n').map((line: string, i: number) => {
                          if (line.startsWith('# ')) return <h2 key={i} style={{ fontWeight: 700, fontSize: '1.25rem', marginTop: i > 0 ? '1.5rem' : 0, marginBottom: '0.5rem' }} className="text-gray-900">{line.slice(2)}</h2>;
                          if (line.startsWith('## ')) return <h3 key={i} style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '1.2rem', marginBottom: '0.4rem' }} className="text-gray-800">{line.slice(3)}</h3>;
                          if (line.startsWith('### ')) return <h4 key={i} style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '1rem', marginBottom: '0.3rem' }} className="text-gray-700">{line.slice(4)}</h4>;
                          if (line.startsWith('```')) return <div key={i} className="bg-gray-800 text-green-400 rounded-lg px-4 py-0.5 text-xs font-mono my-1">{line.slice(3)}</div>;
                          if (line.startsWith('- ')) return <li key={i} className="text-gray-600 text-sm ml-4 mb-1">{line.slice(2)}</li>;
                          if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-indigo-300 pl-4 py-1 text-gray-600 text-sm italic bg-indigo-50 rounded-r-lg my-2">{line.slice(2)}</blockquote>;
                          if (line.trim() === '') return <div key={i} className="h-2" />;
                          return <p key={i} className="text-gray-600 text-sm leading-relaxed mb-1">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-700 text-sm">Nội dung tài liệu sẽ được cập nhật bởi giảng viên phụ trách.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Exercise Content */}
                {currentLesson.type === 'exercise' && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 700 }} className="text-gray-900">📝 Bài tập: {currentLesson.title}</h3>
                        <p className="text-gray-500 text-sm">Loại bài: Bài tập thực hành</p>
                      </div>
                    </div>

                    {/* Đề bài */}
                    {(currentLesson as any).exercisePrompt ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-4">
                        {((currentLesson as any).exercisePrompt as string).split('\n').map((line: string, i: number) => {
                          if (line.startsWith('## ')) return <h3 key={i} style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }} className="text-gray-900">{line.slice(3)}</h3>;
                          if (line.startsWith('### ')) return <h4 key={i} style={{ fontWeight: 600, marginTop: '0.8rem', marginBottom: '0.3rem' }} className="text-gray-800 text-sm">{line.slice(4)}</h4>;
                          if (line.startsWith('- ')) return <li key={i} className="text-gray-700 text-sm ml-4 mb-0.5">{line.slice(2)}</li>;
                          if (line.startsWith('**')) return <p key={i} className="text-orange-700 text-sm mt-2" style={{ fontWeight: 600 }}>{line.replace(/\*\*/g, '')}</p>;
                          if (line.trim() === '') return <div key={i} className="h-2" />;
                          return <p key={i} className="text-gray-700 text-sm mb-1">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                        <p className="text-orange-700 text-sm">Nội dung bài tập sẽ được cập nhật bởi giảng viên phụ trách.</p>
                      </div>
                    )}

                    {/* Form nộp bài */}
                    {exerciseSubmitted ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p style={{ fontWeight: 700 }} className="text-green-700 mb-1">Đã nộp bài thành công!</p>
                        <p className="text-green-600 text-sm">Giảng viên sẽ chấm điểm và phản hồi cho bạn.</p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>✍️ Bài làm của bạn</label>
                        <textarea
                          value={exerciseContent}
                          onChange={e => setExerciseContent(e.target.value)}
                          rows={8}
                          placeholder="Viết bài làm của bạn ở đây..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-gray-50"
                        />
                        <button
                          onClick={async () => {
                            if (!exerciseContent.trim() || !courseId) return;
                            setExerciseSubmitting(true);
                            try {
                              await apiFetch(`/api/enrollments/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(currentLessonId)}/submit`, {
                                auth: true,
                                method: 'POST',
                                body: JSON.stringify({ content: exerciseContent }),
                              } as any);
                              setExerciseSubmitted(true);
                            } catch {
                              alert('Lỗi khi nộp bài. Vui lòng thử lại.');
                            } finally {
                              setExerciseSubmitting(false);
                            }
                          }}
                          disabled={!exerciseContent.trim() || exerciseSubmitting}
                          className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                          style={{ fontWeight: 600 }}
                        >
                          <Send className="w-4 h-4" />
                          {exerciseSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Content */}
                {currentLesson.type === 'quiz' && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 700 }} className="text-gray-900">🧠 Quiz: {currentLesson.title}</h3>
                        <p className="text-gray-500 text-sm">
                          {(currentLesson as any).questions?.length
                            ? `${(currentLesson as any).questions.length} câu hỏi trắc nghiệm`
                            : 'Kiểm tra trắc nghiệm'}
                        </p>
                      </div>
                    </div>

                    {(currentLesson as any).questions && (currentLesson as any).questions.length > 0 ? (
                      <div>
                        <div className="space-y-5">
                          {((currentLesson as any).questions as QuizQuestion[]).map((q, qIndex) => {
                            const selected = quizAnswers[q.id];
                            const isCorrect = selected === q.correctAnswerIndex;
                            return (
                              <div key={q.id} className={`rounded-xl p-4 border ${
                                quizSubmitted
                                  ? isCorrect ? 'border-green-300 bg-green-50' : selected !== undefined ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}>
                                <p style={{ fontWeight: 600 }} className="text-gray-900 text-sm mb-3">
                                  Câu {qIndex + 1}: {q.questionText}
                                </p>
                                <div className="space-y-2">
                                  {q.options.map((opt, optIndex) => {
                                    const letter = String.fromCharCode(65 + optIndex);
                                    const isSelected = selected === optIndex;
                                    const isCorrectOption = q.correctAnswerIndex === optIndex;
                                    let optClass = 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50';
                                    if (quizSubmitted) {
                                      if (isCorrectOption) optClass = 'border-green-400 bg-green-100 ring-1 ring-green-400';
                                      else if (isSelected && !isCorrectOption) optClass = 'border-red-400 bg-red-100';
                                      else optClass = 'border-gray-200 bg-white opacity-60';
                                    } else if (isSelected) {
                                      optClass = 'border-purple-500 bg-purple-50 ring-1 ring-purple-500';
                                    }
                                    return (
                                      <label
                                        key={optIndex}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${optClass} ${quizSubmitted ? 'cursor-default' : ''}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`quiz-${q.id}`}
                                          checked={isSelected}
                                          disabled={quizSubmitted}
                                          onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                                          className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span style={{ fontWeight: 600 }} className="text-gray-500 w-6">{letter}.</span>
                                        <span className="text-gray-700">{opt}</span>
                                        {quizSubmitted && isCorrectOption && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                                        {quizSubmitted && isSelected && !isCorrectOption && <X className="w-4 h-4 text-red-500 ml-auto" />}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Quiz result / submit */}
                        {quizSubmitted ? (
                          <div className="mt-5 bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
                            {(() => {
                              const qs = (currentLesson as any).questions as QuizQuestion[];
                              const correct = qs.filter(q => quizAnswers[q.id] === q.correctAnswerIndex).length;
                              const total = qs.length;
                              const pct = Math.round((correct / total) * 100);
                              return (
                                <>
                                  <p style={{ fontWeight: 700, fontSize: '1.5rem' }} className={pct >= 70 ? 'text-green-600' : 'text-orange-600'}>
                                    {correct}/{total} câu đúng ({pct}%)
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {pct >= 70 ? '🎉 Xuất sắc! Bạn đã nắm vững kiến thức.' : '💪 Hãy ôn lại và thử lại nhé!'}
                                  </p>
                                  <button
                                    onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                                    className="mt-3 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm"
                                    style={{ fontWeight: 600 }}
                                  >
                                    Làm lại
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <button
                            onClick={() => setQuizSubmitted(true)}
                            disabled={Object.keys(quizAnswers).length < ((currentLesson as any).questions as QuizQuestion[]).length}
                            className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mx-auto"
                            style={{ fontWeight: 600 }}
                          >
                            <Send className="w-4 h-4" />
                            Nộp bài ({Object.keys(quizAnswers).length}/{((currentLesson as any).questions as QuizQuestion[]).length})
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-purple-700 text-sm">Câu hỏi quiz sẽ được cập nhật bởi giảng viên phụ trách. Điểm sẽ được tính vào kết quả khóa học.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <ChevronLeft className="w-4 h-4" /> Bài trước
                  </button>

                  <button
                    onClick={handleMarkComplete}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-colors ${
                      isLessonCompleted(currentLessonId)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isLessonCompleted(currentLessonId) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === allLessons.length - 1}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Bài tiếp <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Chọn bài giảng để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Completion Modal */}
      {completionShown && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.75rem' }} className="text-gray-900 mb-2">🎉 Chúc mừng!</h2>
            <p className="text-gray-500 mb-6">
              Bạn đã hoàn thành tất cả bài học trong khóa <strong>{course.title}</strong>!
              Giảng viên sẽ chấm điểm và bạn sẽ nhận chứng chỉ khi đạt từ 70 điểm trở lên.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  void completeCourse(courseId!);
                  navigate('/dashboard');
                }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                style={{ fontWeight: 700 }}
              >
                Về Dashboard xem kết quả
              </button>
              <button
                onClick={() => setCompletionShown(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Tiếp tục ôn tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
