import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/mockData';
import {
  ShoppingCart, X, Star, CreditCard, Shield, Tag, ChevronRight,
  Smartphone, DollarSign, CheckCircle, ArrowLeft, Gift, Zap
} from 'lucide-react';

const paymentMethods = [
  { id: 'credit', label: 'Thẻ tín dụng / Ghi nợ', icon: <CreditCard className="w-5 h-5 text-blue-500" />, desc: 'Visa, Mastercard, JCB' },
  { id: 'momo', label: 'Ví MoMo', icon: <Smartphone className="w-5 h-5 text-pink-500" />, desc: 'Thanh toán qua app MoMo' },
  { id: 'vnpay', label: 'VNPay', icon: <DollarSign className="w-5 h-5 text-red-500" />, desc: 'Cổng thanh toán VNPay' },
  { id: 'zalopay', label: 'ZaloPay', icon: <Zap className="w-5 h-5 text-blue-600" />, desc: 'Thanh toán qua ZaloPay' },
];

export default function Cart() {
  const { cart, allCourses, allInstructors, removeFromCart, checkout } = useApp();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [processing, setProcessing] = useState(false);
  const [checkoutCount, setCheckoutCount] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');

  const cartCourses = cart.map(item => allCourses.find(c => c.id === item.courseId)).filter(Boolean);
  const subtotal = cartCourses.reduce((sum, c) => sum + (c?.discountPrice ?? c?.price ?? 0), 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'EDUPRO10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Mã giảm giá không hợp lệ');
      setCouponApplied(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    if (checkoutStep === 'cart') {
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      setCheckoutCount(cartCourses.length);
      setProcessing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await checkout();
        setProcessing(false);
        setCheckoutStep('success');
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : 'Không thể hoàn tất đăng ký');
        setProcessing(false);
      }
    }
  };

  if (checkoutStep === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-lg">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.75rem' }} className="text-gray-900 mb-2">
            Thanh toán thành công! 🎉
          </h2>
          <p className="text-gray-500 mb-6">
            Bạn đã đăng ký thành công {checkoutCount} khóa học. Chúc bạn học tốt!
          </p>
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="block w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              style={{ fontWeight: 700 }}
            >
              Vào học ngay →
            </Link>
            <Link
              to="/courses"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Khám phá thêm khóa học
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem' }} className="text-gray-700 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-6">Hãy thêm khóa học bạn muốn vào giỏ hàng</p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          style={{ fontWeight: 700 }}
        >
          Khám phá khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => checkoutStep === 'payment' ? setCheckoutStep('cart') : navigate(-1)} className="flex items-center gap-1 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" />
          {checkoutStep === 'payment' ? 'Giỏ hàng' : 'Quay lại'}
        </button>
        <span>/</span>
        <span className={checkoutStep === 'cart' ? 'text-indigo-600' : ''} style={{ fontWeight: checkoutStep === 'cart' ? 600 : 400 }}>Giỏ hàng</span>
        {checkoutStep === 'payment' && (
          <>
            <span>/</span>
            <span className="text-indigo-600" style={{ fontWeight: 600 }}>Thanh toán</span>
          </>
        )}
      </div>

      <h1 style={{ fontWeight: 700, fontSize: '1.75rem' }} className="text-gray-900 mb-8">
        {checkoutStep === 'cart' ? `Giỏ Hàng (${cart.length} khóa học)` : 'Thanh Toán'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left */}
        <div className="flex-1">
          {checkoutStep === 'cart' && (
            <div className="space-y-4">
              {cartCourses.map(course => {
                if (!course) return null;
                const instructor = allInstructors.find(item => item.id === course.instructorId);
                return (
                  <div key={course.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
                    <img src={course.thumbnail} alt={course.title} className="w-28 h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 style={{ fontWeight: 600 }} className="text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                      {instructor && (
                        <p className="text-xs text-gray-500 mb-1">Giảng viên: {instructor.name}</p>
                      )}
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs" style={{ fontWeight: 600 }}>{course.rating}</span>
                        <span className="text-xs text-gray-400">({course.reviews.length} đánh giá)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.discountPrice && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(course.price)}</span>
                        )}
                        <span style={{ fontWeight: 700 }} className="text-indigo-700 text-sm">
                          {formatPrice(course.discountPrice ?? course.price)}
                        </span>
                        {course.discountPrice && (
                          <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        void removeFromCart(course.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-1">Phương thức thanh toán (mô phỏng)</h3>
                <p className="text-xs text-amber-700 mb-4">Chưa tích hợp cổng thanh toán thật; không nhập thông tin thẻ thật.</p>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedPayment === method.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p style={{ fontWeight: 600 }} className="text-gray-900 text-sm">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === method.id ? 'border-indigo-500' : 'border-gray-300'
                      }`}>
                        {selectedPayment === method.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment === 'credit' && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-4">Thông tin thẻ</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Số thẻ</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Ngày hết hạn</label>
                        <input type="text" placeholder="MM/YY" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>CVV</label>
                        <input type="text" placeholder="123" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Tên chủ thẻ</label>
                      <input type="text" placeholder="NGUYEN VAN A" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 uppercase" />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary in payment step */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-4">Đơn hàng của bạn</h3>
                {cartCourses.map(course => course && (
                  <div key={course.id} className="flex gap-3 mb-3">
                    <img src={course.thumbnail} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 line-clamp-1">{course.title}</p>
                    </div>
                    <p style={{ fontWeight: 600 }} className="text-sm text-gray-900 flex-shrink-0">
                      {formatPrice(course.discountPrice ?? course.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-20">
            <h3 style={{ fontWeight: 700 }} className="text-gray-900 mb-4">Tóm tắt đơn hàng</h3>

            {/* Coupon */}
            {checkoutStep === 'cart' && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Mã giảm giá"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-sm hover:bg-indigo-200 transition-colors flex-shrink-0"
                    style={{ fontWeight: 600 }}
                  >
                    Áp dụng
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                {couponApplied && (
                  <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Giảm 10% thành công!
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Thử mã: <span className="text-indigo-600">EDUPRO10</span>
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({cart.length} khóa)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá (10%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-5">
              <div className="flex justify-between items-baseline">
                <span style={{ fontWeight: 700 }} className="text-gray-900">Tổng cộng</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem' }} className="text-indigo-700">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {checkoutStep === 'cart' ? 'Tiến hành thanh toán' : 'Xác nhận thanh toán'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            {checkoutError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{checkoutError}</p>
            )}

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              Thanh toán an toàn & được mã hóa
            </div>

            <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
              <p className="text-xs text-indigo-700 text-center" style={{ fontWeight: 500 }}>
                🔒 Đảm bảo hoàn tiền trong 30 ngày nếu không hài lòng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
