import { createBrowserRouter } from 'react-router';
import MainLayout from './pages/MainLayout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learn from './pages/Learn';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Certificate from './pages/Certificate';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageInstructors from './pages/admin/ManageInstructors';
import ManageStudents from './pages/admin/ManageStudents';
import GradeSubmissions from './pages/admin/GradeSubmissions';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2Redirect from './pages/OAuth2Redirect';

import InstructorLayout from './pages/instructor/InstructorLayout';
import InstructorGradeSubmissions from './pages/instructor/InstructorGradeSubmissions';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/oauth2/redirect',
    Component: OAuth2Redirect,
  },
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: 'courses', Component: Courses },
      { path: 'courses/:courseId', Component: CourseDetail },
      { path: 'dashboard', Component: Dashboard },
      { path: 'cart', Component: Cart },
      { path: 'certificate/:courseId', Component: Certificate },
    ],
  },
  {
    path: '/learn/:courseId',
    Component: Learn,
  },
  {
    path: '/instructor',
    Component: InstructorLayout,
    children: [
      { index: true, Component: InstructorGradeSubmissions },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'courses', Component: ManageCourses },
      { path: 'instructors', Component: ManageInstructors },
      { path: 'students', Component: ManageStudents },
      { path: 'submissions', Component: GradeSubmissions },
    ],
  },
]);
