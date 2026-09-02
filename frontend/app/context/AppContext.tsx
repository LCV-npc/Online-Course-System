import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  CartItem,
  Course,
  Enrollment,
  Instructor,
  Notification,
  User,
} from '../data/mockData';

export type ActivityDay = {
  day: string;
  date: string;
  minutes: number;
};

import { courses as fallbackCourses, instructors as fallbackInstructors } from '../data/mockData';
import { apiFetch } from '../lib/api';

type AuthState = {
  token: string | null;
  currentUser: User;
  isAuthenticated: boolean;
  authLoading: boolean;
};

type AppContextType = {
  token: string | null;
  currentUser: User;
  isAuthenticated: boolean;
  authLoading: boolean;

  enrollments: Enrollment[];
  cart: CartItem[];
  notifications: Notification[];
  allCourses: Course[];
  allInstructors: Instructor[];
  weeklyActivity: ActivityDay[];

  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  logStudyActivity: (minutes: number) => Promise<void>;

  // Enrollment actions
  enrollCourse: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  completeLesson: (courseId: string, lessonId: string) => Promise<void>;
  getProgress: (courseId: string) => number;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  completeCourse: (courseId: string) => Promise<void>;

  // Cart actions
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  isInCart: (courseId: string) => boolean;
  clearCart: () => void;
  checkout: () => Promise<void>;

  // Notification actions
  markNotificationRead: (id: string) => Promise<void>;
  unreadCount: number;

  // Admin actions
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addInstructor: (instructor: Instructor) => Promise<void>;
  updateInstructor: (instructor: Instructor) => Promise<void>;
  deleteInstructor: (instructorId: string) => Promise<void>;

  // Review
  addReview: (courseId: string, rating: number, comment: string) => Promise<void>;
};

const guestUser: User = {
  id: 'guest',
  name: 'Chưa đăng nhập',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  role: 'student',
  joinedDate: '—',
};

const AppContext = createContext<AppContextType | null>(null);

function safeTodayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEnrollmentForOptimistic(enr: Enrollment): Enrollment {
  return {
    ...enr,
    completedLessons: Array.isArray(enr.completedLessons) ? enr.completedLessons : [],
    lastAccessedLesson: enr.lastAccessedLesson ?? '',
    completed: Boolean(enr.completed),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    currentUser: guestUser,
    isAuthenticated: false,
    authLoading: true,
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityDay[]>([
    { day: 'T2', date: '', minutes: 0 },
    { day: 'T3', date: '', minutes: 0 },
    { day: 'T4', date: '', minutes: 0 },
    { day: 'T5', date: '', minutes: 0 },
    { day: 'T6', date: '', minutes: 0 },
    { day: 'T7', date: '', minutes: 0 },
    { day: 'CN', date: '', minutes: 0 },
  ]);

  const token = auth.token;

  const fetchInitialPublicData = useCallback(async (authenticated = false) => {
    try {
      const [courses, instructors] = await Promise.all([
        apiFetch<Course[]>('/api/courses', { auth: authenticated }),
        apiFetch<Instructor[]>('/api/instructors', { auth: authenticated }),
      ]);
      setAllCourses(courses || fallbackCourses);
      setAllInstructors(instructors || fallbackInstructors);
    } catch {
      // Development fallback: keep UI usable when DB isn't ready
      setAllCourses(fallbackCourses);
      setAllInstructors(fallbackInstructors);
    }
  }, []);

  const fetchPrivateData = useCallback(async () => {
    const [enr, cartRes, notifRes, activityRes] = await Promise.all([
      apiFetch<Enrollment[]>('/api/enrollments/me', { auth: true }),
      apiFetch<CartItem[]>('/api/cart', { auth: true }),
      apiFetch<Notification[]>('/api/notifications', { auth: true }),
      apiFetch<ActivityDay[]>('/api/activity/weekly', { auth: true }).catch(() => []),
    ]);
    setEnrollments(enr || []);
    setCart(cartRes || []);
    setNotifications(notifRes || []);
    if (activityRes && activityRes.length > 0) {
      setWeeklyActivity(activityRes);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchInitialPublicData();

        const stored = (() => {
          try {
            return localStorage.getItem('edupro_token');
          } catch {
            return null;
          }
        })();

        if (!stored) {
          if (!cancelled) {
            setAuth((p) => ({ ...p, token: null, currentUser: guestUser, isAuthenticated: false, authLoading: false }));
          }
          return;
        }

        // verify token + load profile
        const me = await apiFetch<User>('/api/auth/me', { auth: true });
        if (cancelled) return;
        setAuth({ token: stored, currentUser: me || guestUser, isAuthenticated: true, authLoading: false });
        await Promise.all([fetchInitialPublicData(true), fetchPrivateData()]);
      } catch (e) {
        // invalid token or server down -> treat as logged out
        if (!cancelled) {
          try {
            localStorage.removeItem('edupro_token');
          } catch {}
          setAuth({ token: null, currentUser: guestUser, isAuthenticated: false, authLoading: false });
          setEnrollments([]);
          setCart([]);
          setNotifications([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchInitialPublicData, fetchPrivateData]);

  const isEnrolled = useCallback(
    (courseId: string) => {
      if (!auth.isAuthenticated || !auth.currentUser) return false;
      return enrollments.some((e) => e.userId === auth.currentUser.id && e.courseId === courseId);
    },
    [auth.currentUser?.id, auth.isAuthenticated, enrollments],
  );

  const getEnrollment = useCallback(
    (courseId: string) => {
      if (!auth.isAuthenticated || !auth.currentUser) return undefined;
      return enrollments.find((e) => e.userId === auth.currentUser.id && e.courseId === courseId);
    },
    [auth.currentUser?.id, auth.isAuthenticated, enrollments],
  );

  const allLessonsCount = useCallback(
    (courseId: string) => {
      const course = allCourses.find((c) => c.id === courseId);
      if (!course) return 0;
      return course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
    },
    [allCourses],
  );

  const getProgress = useCallback(
    (courseId: string) => {
      const enrollment = getEnrollment(courseId);
      if (!enrollment) return 0;
      const totalLessons = allLessonsCount(courseId);
      if (totalLessons === 0) return 0;
      const completedCount = (enrollment.completedLessons || []).length;
      return Math.round((completedCount / totalLessons) * 100);
    },
    [getEnrollment, allLessonsCount],
  );

  const enrollCourse = useCallback(
    async (courseId: string) => {
      if (!token) throw new Error('Bạn cần đăng nhập để đăng ký khóa học.');
      const next = await apiFetch<Enrollment>('/api/enrollments', {
        auth: true,
        method: 'POST',
        body: JSON.stringify({ courseId }),
      } as any);
      setEnrollments((prev) => {
        // replace or add
        const idx = prev.findIndex((e) => e.userId === next.userId && e.courseId === next.courseId);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = next;
          return clone;
        }
        return [...prev, next];
      });
    },
    [token],
  );

  const completeLesson = useCallback(
    async (courseId: string, lessonId: string) => {
      if (!token) throw new Error('Bạn cần đăng nhập.');

      const enrollment = getEnrollment(courseId);
      if (!enrollment) return;
      const current = normalizeEnrollmentForOptimistic(enrollment);
      const nextCompletedLessons = current.completedLessons.includes(lessonId)
        ? current.completedLessons
        : [...current.completedLessons, lessonId];

      // optimistic update
      const optimistic: Enrollment = {
        ...current,
        completedLessons: nextCompletedLessons,
        lastAccessedLesson: lessonId,
      };
      setEnrollments((prev) => prev.map((e) => (e.id === enrollment.id ? optimistic : e)));

      try {
        const saved = await apiFetch<Enrollment>(`/api/enrollments/${encodeURIComponent(courseId)}`, {
          auth: true,
          method: 'PATCH',
          body: JSON.stringify({
            completedLessons: nextCompletedLessons,
            lastAccessedLesson: lessonId,
          }),
        } as any);
        setEnrollments((prev) => prev.map((e) => (e.id === enrollment.id ? saved : e)));

        // Kiểm tra nếu hoàn thành 100% bài học → tự động gửi chấm điểm
        const course = allCourses.find((c) => c.id === courseId);
        if (course) {
          const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
          if (nextCompletedLessons.length >= totalLessons && !enrollment.completed) {
            try {
              await apiFetch('/api/enrollments/' + encodeURIComponent(courseId) + '/submit-for-grading', {
                auth: true,
                method: 'POST',
                body: JSON.stringify({
                  content: 'Học viên đã hoàn thành tất cả ' + totalLessons + ' bài học và yêu cầu chấm điểm.',
                }),
              } as any);
            } catch {
              // ignore - may already be submitted
            }
          }
        }
      } catch {
        setEnrollments((prev) => prev.map((e) => (e.id === enrollment.id ? current : e)));
      }
    },
    [getEnrollment, token, allCourses],
  );

  const completeCourse = useCallback(
    async (courseId: string) => {
      if (!token) throw new Error('Bạn cần đăng nhập.');
      const enrollment = getEnrollment(courseId);
      if (!enrollment || enrollment.completed) return;

      // Gửi bài nộp cho giảng viên chấm điểm (KHÔNG đánh dấu completed)
      try {
        await apiFetch('/api/enrollments/' + encodeURIComponent(courseId) + '/submit-for-grading', {
          auth: true,
          method: 'POST',
          body: JSON.stringify({
            content: 'Học viên đã hoàn thành tất cả bài học và yêu cầu chấm điểm.',
          }),
        } as any);
      } catch {
        // ignore
      }
    },
    [getEnrollment, token],
  );

  const isInCart = useCallback(
    (courseId: string) => {
      return cart.some((item) => item.courseId === courseId);
    },
    [cart],
  );

  const addToCart = useCallback(
    async (courseId: string) => {
      if (!token) throw new Error('Bạn cần đăng nhập để thêm vào giỏ.');
      const existing = cart.some((i) => i.courseId === courseId);
      if (existing) return;

      await apiFetch<{ ok: true }>(`/api/cart`, {
        auth: true,
        method: 'POST',
        body: JSON.stringify({ courseId }),
      } as any);

      const updated = await apiFetch<CartItem[]>('/api/cart', { auth: true });
      setCart(updated);
    },
    [cart, token],
  );

  const removeFromCart = useCallback(
    async (courseId: string) => {
      if (!token) return;
      await apiFetch<void>(`/api/cart/${encodeURIComponent(courseId)}`, {
        auth: true,
        method: 'DELETE',
      } as any);
      const updated = await apiFetch<CartItem[]>('/api/cart', { auth: true });
      setCart(updated);
    },
    [token],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback(async () => {
    if (!token) throw new Error('Bạn cần đăng nhập để thanh toán.');
    await apiFetch<{ ok: boolean; count: number }>('/api/cart/checkout', { auth: true, method: 'POST' } as any);

    // refresh private data after checkout
    const [enr, cartRes, notifRes] = await Promise.all([
      apiFetch<Enrollment[]>('/api/enrollments/me', { auth: true }),
      apiFetch<CartItem[]>('/api/cart', { auth: true }),
      apiFetch<Notification[]>('/api/notifications', { auth: true }),
    ]);
    setEnrollments(enr || []);
    setCart(cartRes || []);
    setNotifications(notifRes || []);
  }, [token]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (!token) return;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      try {
        await apiFetch('/api/notifications/' + encodeURIComponent(id) + '/read', {
          auth: true,
          method: 'PATCH',
        } as any);
      } catch {
        // ignore
      }
    },
    [token],
  );

  const unreadCount = useMemo(() => (notifications || []).filter((n) => !n.read).length, [notifications]);

  // Admin actions
  const addCourse = useCallback(
    async (course: Course) => {
      const saved = await apiFetch<Course>('/api/courses', {
        auth: true,
        method: 'POST',
        body: JSON.stringify(course),
      } as any);
      setAllCourses((prev) => [...prev, saved]);
    },
    [],
  );

  const updateCourse = useCallback(
    async (course: Course) => {
      const saved = await apiFetch<Course>(`/api/courses/${encodeURIComponent(course.id)}`, {
        auth: true,
        method: 'PUT',
        body: JSON.stringify(course),
      } as any);
      setAllCourses((prev) => prev.map((c) => (c.id === course.id ? saved : c)));
    },
    [],
  );

  const deleteCourse = useCallback(async (courseId: string) => {
    await apiFetch<void>(`/api/courses/${encodeURIComponent(courseId)}`, { auth: true, method: 'DELETE' } as any);
    setAllCourses((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  const addInstructor = useCallback(
    async (instructor: Instructor) => {
      setAllInstructors((prev) => [...prev, instructor]);
    },
    [],
  );

  const updateInstructor = useCallback(
    async (instructor: Instructor) => {
      setAllInstructors((prev) => prev.map((i) => (i.id === instructor.id ? instructor : i)));
    },
    [],
  );

  const deleteInstructor = useCallback(async (instructorId: string) => {
    setAllInstructors((prev) => prev.filter((i) => i.id !== instructorId));
  }, []);

  const addReview = useCallback(
    async (courseId: string, rating: number, comment: string) => {
      const saved = await apiFetch<Course>(`/api/courses/${encodeURIComponent(courseId)}/reviews`, {
        auth: true,
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      } as any);
      setAllCourses((prev) => prev.map((c) => (c.id === courseId ? saved : c)));
    },
    [],
  );

  const logStudyActivity = useCallback(async (minutes: number) => {
    if (!token) return;
    try {
      await apiFetch('/api/activity/log', {
        auth: true,
        method: 'POST',
        body: JSON.stringify({ minutes }),
      } as any);
      
      // Update local activity optimistic or refetch
      setWeeklyActivity((prev) => {
        const todayStr = safeTodayISODate();
        const next = [...prev];
        const lastIdx = next.length - 1;
        // The last item in the backend's array is usually today, but let's check date
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].date === todayStr) {
            next[i] = { ...next[i], minutes: next[i].minutes + minutes };
            return next;
          }
        }
        // If date didn't match, just add to the last element (which should be today)
        next[lastIdx] = { ...next[lastIdx], minutes: next[lastIdx].minutes + minutes };
        return next;
      });
    } catch {
      // ignore
    }
  }, [token]);

  const value = useMemo<AppContextType>(
    () => ({
      token,
      currentUser: auth.currentUser,
      isAuthenticated: auth.isAuthenticated,
      authLoading: auth.authLoading,

      enrollments,
      cart,
      notifications,
      allCourses,
      allInstructors,
      weeklyActivity,

      login: async (email, password) => {
        const { token: newToken, user } = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
          auth: false,
          method: 'POST',
          body: JSON.stringify({ email, password }),
        } as any);
        try {
          localStorage.setItem('edupro_token', newToken);
        } catch {}
        setAuth({ token: newToken, currentUser: user || guestUser, isAuthenticated: true, authLoading: false });
        await Promise.all([fetchInitialPublicData(true), fetchPrivateData()]);
        return user || guestUser;
      },

      register: async (name, email, password) => {
        const { token: newToken, user } = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
          auth: false,
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        } as any);
        try {
          localStorage.setItem('edupro_token', newToken);
        } catch {}
        setAuth({ token: newToken, currentUser: user || guestUser, isAuthenticated: true, authLoading: false });
        await Promise.all([fetchInitialPublicData(true), fetchPrivateData()]);
      },

      logout: () => {
        try {
          localStorage.removeItem('edupro_token');
        } catch {}
        setAuth({ token: null, currentUser: guestUser, isAuthenticated: false, authLoading: false });
        setEnrollments([]);
        setCart([]);
        setNotifications([]);
      },

      enrollCourse,
      isEnrolled,
      completeLesson,
      getProgress,
      getEnrollment,
      completeCourse,

      addToCart,
      removeFromCart,
      isInCart,
      clearCart,
      checkout,

      markNotificationRead,
      unreadCount,

      addCourse,
      updateCourse,
      deleteCourse,
      addInstructor,
      updateInstructor,
      deleteInstructor,
      addReview,
      logStudyActivity,
    }),
    [
      token,
      auth.currentUser,
      auth.isAuthenticated,
      auth.authLoading,
      enrollments,
      cart,
      notifications,
      allCourses,
      allInstructors,
      weeklyActivity,
      enrollCourse,
      isEnrolled,
      completeLesson,
      getProgress,
      getEnrollment,
      completeCourse,
      addToCart,
      removeFromCart,
      isInCart,
      clearCart,
      checkout,
      markNotificationRead,
      unreadCount,
      addCourse,
      updateCourse,
      deleteCourse,
      addInstructor,
      updateInstructor,
      deleteInstructor,
      addReview,
      logStudyActivity,
      fetchPrivateData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
