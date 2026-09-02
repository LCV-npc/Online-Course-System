import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/mockData';
import {
  Star, Clock, Users, BookOpen, Award, CheckCircle, Play, FileText,
  HelpCircle, Download, ShoppingCart, ChevronDown, ChevronUp,
  Globe, BarChart3, Calendar, ArrowLeft, Lock
} from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { allCourses, allInstructors, isEnrolled, addToCart, isInCart, addReview } = useApp();
  const navigate = useNavigate();

  const course = allCourses.find(c => c.id === courseId);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([course?.chapters[0]?.id || '']);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 style={{ fontWeight: 700 }} className="text-2xl text-gray-700 mb-4">Không tìm thấy khóa học</h2>
        <Link to="/courses" className="text-indigo-600 hover:underline">← Quay lại danh sách</Link>
      </div>
    );
  }

  const instructor = allInstructors.find(item => item.id === course.instructorId);
  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const lessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4 text-blue-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'document': return <FileText className="w-4 h-4 text-green-500" />;
      case 'exercise': return <Download className="w-4 h-4 text-orange-500" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const handleSubmitReview = async () => {
    if (reviewComment.trim()) {
      setActionError('');
      try {
        await addReview(course.id, reviewRating, reviewComment);
      setReviewSubmitted(true);
      setReviewComment('');
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Không thể gửi đánh giá');
      }
    }
  };

  const handleAddToCart = async (goToCart = false) => {
    setActionError('');
    try {
      await addToCart(course.id);
      if (goToCart) navigate('/cart');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể thêm khóa học vào giỏ');
    }
  };

  const avgRating = course.reviews.reduce((s, r) => s + r.rating, 0) / (course.reviews.length || 1);
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    r,
    count: course.reviews.filter(rev => rev.rating === r).length,
    pct: (course.reviews.filter(rev => rev.rating === r).length / (course.reviews.length || 1)) * 100,
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      {actionError && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{actionError}</p>
        </div>
      )}
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">{course.category}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  course.level === 'Cơ bản' ? 'bg-green-600' : course.level === 'Trung cấp' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>{course.level}</span>
              </div>
              <h1 className="text-white mb-4" style={{ fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{course.title}</h1>
              <p className="text-gray-300 mb-5 text-lg">{course.shortDesc}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span style={{ fontWeight: 700 }} className="text-yellow-400">{course.rating}</span>
                  <span>({course.reviews.length} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />{course.totalStudents.toLocaleString()} học viên</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</div>
                <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.totalLessons} bài giảng</div>
                <div className="flex items-center gap-1"><Globe className="w-4 h-4" />{course.language}</div>
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Cập nhật: {course.lastUpdated}</div>
              </div>

              {instructor && (
                <div className="flex items-center gap-3 mt-5">
                  <img src={instructor.avatar} alt={instructor.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-xs text-gray-400">Giảng viên</p>
                    <p style={{ fontWeight: 600 }} className="text-white">{instructor.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Buy Card - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl sticky top-20">
                <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
                <div className="p-5">
                  <div className="mb-3">
                    {course.discountPrice ? (
                      <div>
                        <span className="text-gray-400 line-through text-sm">{formatPrice(course.price)}</span>
                        <p style={{ fontWeight: 800, fontSize: '1.75rem' }} className="text-indigo-700">{formatPrice(course.discountPrice)}</p>
                        <span className="text-red-500 text-sm" style={{ fontWeight: 600 }}>
                          Tiết kiệm {formatPrice(course.price - course.discountPrice)}
                        </span>
                      </div>
                    ) : (
                      <p style={{ fontWeight: 800, fontSize: '1.75rem' }} className="text-indigo-700">{formatPrice(course.price)}</p>
                    )}
                  </div>

                  {enrolled ? (
                    <Link
                      to={`/learn/${course.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors mb-3"
                      style={{ fontWeight: 700 }}
                    >
                      <Play className="w-5 h-5" />
                      Tiếp tục học
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => void handleAddToCart(true)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors mb-2"
                        style={{ fontWeight: 700 }}
                      >
                        Mua ngay
                      </button>
                      {inCart ? (
                        <Link
                          to="/cart"
                          className="w-full flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl transition-colors hover:bg-indigo-50"
                          style={{ fontWeight: 700 }}
                        >
                          <CheckCircle className="w-5 h-5" /> Đã có trong giỏ hàng
                        </Link>
                      ) : (
                        <button
                          onClick={() => void handleAddToCart()}
                          className="w-full flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl transition-colors hover:bg-indigo-50"
                          style={{ fontWeight: 700 }}
                        >
                          <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
                        </button>
                      )}
                    </>
                  )}

                  <p className="text-center text-xs text-gray-400 mt-3">Đảm bảo hoàn tiền trong 30 ngày</p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{course.totalLessons} bài giảng</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{course.duration} nội dung học</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Học mọi lúc, mọi nơi</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Truy cập trọn đời</div>
                    {course.certificate && <div className="flex items-center gap-2"><Award className="w-4 h-4 text-indigo-500" />Cấp chứng chỉ hoàn thành</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Buy Bar */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div>
          {course.discountPrice ? (
            <p style={{ fontWeight: 700 }} className="text-indigo-700">{formatPrice(course.discountPrice)}</p>
          ) : (
            <p style={{ fontWeight: 700 }} className="text-indigo-700">{formatPrice(course.price)}</p>
          )}
        </div>
        {enrolled ? (
          <Link to={`/learn/${course.id}`} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm" style={{ fontWeight: 600 }}>
            Học tiếp
          </Link>
        ) : (
          <button
            onClick={() => void handleAddToCart()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm"
            style={{ fontWeight: 600 }}
          >
            {inCart ? 'Đến giỏ hàng' : 'Thêm giỏ hàng'}
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
              {(['overview', 'curriculum', 'instructor', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ fontWeight: activeTab === tab ? 600 : 400 }}
                >
                  {tab === 'overview' ? 'Tổng quan' : tab === 'curriculum' ? 'Nội dung' : tab === 'instructor' ? 'Giảng viên' : 'Đánh giá'}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Objectives */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-4 text-lg">Bạn sẽ học được gì?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-4 text-lg">Yêu cầu đầu vào</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-indigo-400 mt-0.5">•</span>{req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-4 text-lg">Mô tả khóa học</h3>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm">{course.chapters.length} chương • {course.totalLessons} bài giảng • {course.duration}</p>
                </div>
                {course.chapters.map(chapter => (
                  <div key={chapter.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <p style={{ fontWeight: 600 }} className="text-gray-900">{chapter.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{chapter.lessons.length} bài giảng</p>
                      </div>
                      {expandedChapters.includes(chapter.id) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    {expandedChapters.includes(chapter.id) && (
                      <div className="border-t border-gray-100">
                        {chapter.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className={`flex items-center gap-3 px-5 py-3 ${idx !== 0 ? 'border-t border-gray-50' : ''} ${enrolled ? 'hover:bg-indigo-50' : ''}`}>
                            <div className="flex-shrink-0">{lessonTypeIcon(lesson.type)}</div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{lesson.title}</p>
                              <p className="text-xs text-gray-400">{lesson.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">{lesson.duration}</span>
                              {!enrolled && idx > 1 && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && instructor && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-5 mb-5">
                  <img src={instructor.avatar} alt={instructor.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <h3 style={{ fontWeight: 700 }} className="text-xl text-gray-900 mb-1">{instructor.name}</h3>
                    <p className="text-indigo-600 text-sm mb-2">{instructor.specialty}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />{instructor.rating} đánh giá</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{instructor.students.toLocaleString()} học viên</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{instructor.courses.length} khóa học</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" />{instructor.experience} kinh nghiệm</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{instructor.bio}</p>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-5">
                {/* Rating Summary */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex gap-8 items-center">
                    <div className="text-center">
                      <p style={{ fontWeight: 800, fontSize: '3rem' }} className="text-indigo-700 leading-none">{avgRating.toFixed(1)}</p>
                      <div className="flex items-center gap-0.5 justify-center my-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{course.reviews.length} đánh giá</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingDist.map(({ r, count, pct }) => (
                        <div key={r} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4">{r}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-4">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Write Review */}
                {enrolled && !reviewSubmitted && (
                  <div className="bg-white rounded-2xl p-6 border border-indigo-100">
                    <h4 style={{ fontWeight: 700 }} className="text-gray-900 mb-4">Viết đánh giá của bạn</h4>
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setReviewRating(s)}>
                          <Star className={`w-7 h-7 transition-colors ${s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm học của bạn..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    />
                    <button
                      onClick={() => void handleSubmitReview()}
                      disabled={!reviewComment.trim()}
                      className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                )}
                {reviewSubmitted && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span>Cảm ơn bạn đã đánh giá khóa học!</span>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {course.reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span style={{ fontWeight: 700 }} className="text-indigo-600 text-sm">
                            {review.userName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p style={{ fontWeight: 600 }} className="text-gray-900">{review.userName}</p>
                            <p className="text-xs text-gray-400">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-0.5 my-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop spacer */}
          <div className="hidden lg:block w-80 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
