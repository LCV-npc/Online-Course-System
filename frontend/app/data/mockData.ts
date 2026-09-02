export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  specialty: string;
  courses: string[];
  rating: number;
  students: number;
  experience: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'document' | 'exercise';
  duration: string;
  description: string;
  completed?: boolean;
  videoUrl?: string;
  documentContent?: string;
  exercisePrompt?: string;
  questions?: QuizQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDesc: string;
  instructorId: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  category: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  duration: string;
  totalLessons: number;
  rating: number;
  totalStudents: number;
  language: string;
  tags: string[];
  chapters: Chapter[];
  reviews: Review[];
  requirements: string[];
  objectives: string[];
  lastUpdated: string;
  certificate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'admin' | 'instructor';
  joinedDate: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledDate: string;
  completedLessons: string[];
  lastAccessedLesson: string;
  completed: boolean;
  completedDate?: string;
  grade?: number;
}

export interface CartItem {
  courseId: string;
  addedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  date: string;
  read: boolean;
}

// ===================== INSTRUCTORS =====================
export const instructors: Instructor[] = [
  {
    id: 'ins1',
    name: 'Trần Minh Khoa',
    email: 'khoa.tran@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Chuyên gia lập trình với 10 năm kinh nghiệm, từng làm việc tại Google và Microsoft. Giảng dạy tại Đại học Bách Khoa Hà Nội.',
    specialty: 'Lập trình Web, React, TypeScript',
    courses: ['c1', 'c5'],
    rating: 4.9,
    students: 15420,
    experience: '10 năm',
  },
  {
    id: 'ins2',
    name: 'Nguyễn Thị Lan',
    email: 'lan.nguyen@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    bio: 'Tiến sĩ Khoa học dữ liệu từ Đại học NUS Singapore. Chuyên gia về Machine Learning và AI với nhiều công trình nghiên cứu quốc tế.',
    specialty: 'Data Science, Machine Learning, Python',
    courses: ['c2', 'c6'],
    rating: 4.8,
    students: 12300,
    experience: '8 năm',
  },
  {
    id: 'ins3',
    name: 'Lê Văn Đức',
    email: 'duc.le@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'UI/UX Designer với kinh nghiệm làm việc tại các agency hàng đầu. Đã thiết kế cho hơn 200 dự án lớn nhỏ khác nhau.',
    specialty: 'UI/UX Design, Figma, Photoshop',
    courses: ['c3', 'c7'],
    rating: 4.7,
    students: 8900,
    experience: '7 năm',
  },
  {
    id: 'ins4',
    name: 'Phạm Thị Hương',
    email: 'huong.pham@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Chuyên gia Marketing số với hơn 5 năm kinh nghiệm quản lý chiến dịch cho các thương hiệu lớn tại Việt Nam và quốc tế.',
    specialty: 'Digital Marketing, SEO, Social Media',
    courses: ['c4', 'c10'],
    rating: 4.6,
    students: 9750,
    experience: '6 năm',
  },
  {
    id: 'ins5',
    name: 'Hoàng Quốc Bảo',
    email: 'bao.hoang@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Kỹ sư DevOps cấp cao với chứng chỉ AWS, Azure và Google Cloud. Chuyên gia về CI/CD và quản lý hạ tầng đám mây.',
    specialty: 'DevOps, Cloud, Docker, Kubernetes',
    courses: ['c8', 'c9', 'c11', 'c12'],
    rating: 4.8,
    students: 11200,
    experience: '9 năm',
  },
];

// ===================== COURSES =====================
export const courses: Course[] = [
  {
    id: 'c1',
    title: 'React và TypeScript Nâng Cao',
    shortDesc: 'Làm chủ React 18 và TypeScript để xây dựng ứng dụng web hiện đại, có khả năng mở rộng cao.',
    description: 'Khóa học toàn diện về React và TypeScript, từ các khái niệm cơ bản đến kỹ thuật nâng cao nhất. Bạn sẽ học cách xây dựng ứng dụng web chuyên nghiệp với React 18, TypeScript, Redux Toolkit, React Query và nhiều công nghệ hiện đại khác.',
    instructorId: 'ins1',
    price: 1299000,
    discountPrice: 799000,
    thumbnail: 'https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?w=600&h=340&fit=crop',
    category: 'Lập trình',
    level: 'Nâng cao',
    duration: '42 giờ',
    totalLessons: 156,
    rating: 4.9,
    totalStudents: 8420,
    language: 'Tiếng Việt',
    tags: ['React', 'TypeScript', 'JavaScript', 'Frontend'],
    lastUpdated: '2024-12-15',
    certificate: true,
    requirements: [
      'Kiến thức cơ bản về HTML, CSS, JavaScript',
      'Đã học qua React cơ bản',
      'Máy tính có cài Node.js',
    ],
    objectives: [
      'Xây dựng ứng dụng React với TypeScript',
      'Quản lý state với Redux Toolkit và React Query',
      'Tối ưu hóa hiệu suất ứng dụng React',
      'Triển khai ứng dụng lên production',
    ],
    chapters: [
      {
        id: 'ch1-1',
        title: 'Giới thiệu và Cài đặt',
        lessons: [
          { id: 'l1-1-1', title: 'Giới thiệu khóa học', type: 'video', duration: '5:30', description: 'Tổng quan về nội dung khóa học' },
          { id: 'l1-1-2', title: 'Cài đặt môi trường phát triển', type: 'video', duration: '12:00', description: 'Cài đặt Node.js, VSCode và các extension' },
          { id: 'l1-1-3', title: 'Tạo dự án React với TypeScript', type: 'video', duration: '15:20', description: 'Khởi tạo dự án với Vite và TypeScript' },
        ],
      },
      {
        id: 'ch1-2',
        title: 'TypeScript Fundamentals',
        lessons: [
          { id: 'l1-2-1', title: 'Kiểu dữ liệu trong TypeScript', type: 'video', duration: '20:00', description: 'Các kiểu dữ liệu cơ bản và nâng cao' },
          { id: 'l1-2-2', title: 'Interface và Type Alias', type: 'document', duration: '18:30', description: 'Định nghĩa cấu trúc dữ liệu' },
          { id: 'l1-2-3', title: 'Generics trong TypeScript', type: 'video', duration: '25:00', description: 'Sử dụng Generics để tái sử dụng code' },
          { id: 'l1-2-4', title: 'Bài tập TypeScript', type: 'exercise', duration: '30:00', description: 'Thực hành các khái niệm đã học' },
          { id: 'l1-2-5', title: 'Kiểm tra TypeScript Basics', type: 'quiz', duration: '20:00', description: 'Quiz kiểm tra kiến thức TypeScript' },
        ],
      },
      {
        id: 'ch1-3',
        title: 'React Hooks Nâng Cao',
        lessons: [
          { id: 'l1-3-1', title: 'useEffect nâng cao', type: 'video', duration: '22:00', description: 'Cleanup, dependencies và race conditions' },
          { id: 'l1-3-2', title: 'useCallback và useMemo', type: 'video', duration: '18:00', description: 'Tối ưu hóa hiệu suất với memoization' },
          { id: 'l1-3-3', title: 'Custom Hooks', type: 'video', duration: '30:00', description: 'Tạo và tái sử dụng custom hooks' },
          { id: 'l1-3-4', title: 'Context API', type: 'video', duration: '25:00', description: 'Quản lý state toàn cục với Context' },
        ],
      },
    ],
    reviews: [
      { id: 'r1-1', userId: 'u1', userName: 'Nguyễn Văn An', userAvatar: '', rating: 5, comment: 'Khóa học tuyệt vời! Nội dung chi tiết và dễ hiểu. Giảng viên giải thích rất rõ ràng.', date: '2024-11-20' },
      { id: 'r1-2', userId: 'u2', userName: 'Trần Thị Bích', userAvatar: '', rating: 5, comment: 'Rất hài lòng với khóa học này. Đã áp dụng được ngay vào dự án thực tế.', date: '2024-11-25' },
      { id: 'r1-3', userId: 'u3', userName: 'Lê Minh Tuấn', userAvatar: '', rating: 4, comment: 'Nội dung phong phú, chỉ mong có thêm bài tập thực hành hơn.', date: '2024-12-01' },
    ],
  },
  {
    id: 'c2',
    title: 'Python cho Khoa học Dữ liệu',
    shortDesc: 'Học Python từ cơ bản đến nâng cao cho Data Science, bao gồm Pandas, NumPy, Matplotlib và Scikit-learn.',
    description: 'Khóa học toàn diện về Python dành cho Data Science. Bắt đầu từ Python cơ bản, tiến đến phân tích dữ liệu với Pandas, trực quan hóa với Matplotlib và Seaborn, và xây dựng mô hình Machine Learning với Scikit-learn.',
    instructorId: 'ins2',
    price: 1099000,
    discountPrice: 699000,
    thumbnail: 'https://images.unsplash.com/photo-1653564142048-d5af2cf9b50f?w=600&h=340&fit=crop',
    category: 'Data Science',
    level: 'Trung cấp',
    duration: '38 giờ',
    totalLessons: 134,
    rating: 4.8,
    totalStudents: 6230,
    language: 'Tiếng Việt',
    tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
    lastUpdated: '2024-12-10',
    certificate: true,
    requirements: [
      'Kiến thức lập trình cơ bản',
      'Toán học cơ bản (thống kê)',
    ],
    objectives: [
      'Thành thạo Python cho phân tích dữ liệu',
      'Xử lý và làm sạch dữ liệu với Pandas',
      'Trực quan hóa dữ liệu chuyên nghiệp',
      'Xây dựng mô hình Machine Learning cơ bản',
    ],
    chapters: [
      {
        id: 'ch2-1',
        title: 'Python Cơ Bản',
        lessons: [
          { id: 'l2-1-1', title: 'Cài đặt Python và Jupyter Notebook', type: 'video', duration: '10:00', description: 'Thiết lập môi trường làm việc' },
          { id: 'l2-1-2', title: 'Kiểu dữ liệu và biến trong Python', type: 'video', duration: '20:00', description: 'Các kiểu dữ liệu cơ bản' },
          { id: 'l2-1-3', title: 'Vòng lặp và điều kiện', type: 'video', duration: '25:00', description: 'Control flow trong Python' },
          { id: 'l2-1-4', title: 'Hàm và Module', type: 'video', duration: '30:00', description: 'Tổ chức code với hàm và module' },
        ],
      },
      {
        id: 'ch2-2',
        title: 'Pandas và NumPy',
        lessons: [
          { id: 'l2-2-1', title: 'Giới thiệu NumPy', type: 'video', duration: '22:00', description: 'Mảng đa chiều và phép tính số học' },
          { id: 'l2-2-2', title: 'DataFrames với Pandas', type: 'video', duration: '35:00', description: 'Đọc, xử lý và phân tích dữ liệu' },
          { id: 'l2-2-3', title: 'Làm sạch dữ liệu', type: 'video', duration: '28:00', description: 'Xử lý dữ liệu thiếu và ngoại lệ' },
          { id: 'l2-2-4', title: 'Bài tập Pandas', type: 'exercise', duration: '45:00', description: 'Phân tích dataset thực tế' },
          { id: 'l2-2-5', title: 'Quiz Pandas', type: 'quiz', duration: '20:00', description: 'Kiểm tra kiến thức Pandas' },
        ],
      },
    ],
    reviews: [
      { id: 'r2-1', userId: 'u1', userName: 'Nguyễn Văn An', userAvatar: '', rating: 5, comment: 'Giảng viên giảng dạy rất bài bản, từng bước rõ ràng.', date: '2024-10-15' },
      { id: 'r2-2', userId: 'u4', userName: 'Võ Thị Mai', userAvatar: '', rating: 4, comment: 'Nội dung phong phú, phù hợp với người mới bắt đầu.', date: '2024-11-02' },
    ],
  },
  {
    id: 'c3',
    title: 'Thiết Kế UI/UX với Figma',
    shortDesc: 'Học thiết kế giao diện người dùng chuyên nghiệp từ wireframe đến prototype với Figma.',
    description: 'Khóa học UI/UX Design toàn diện sử dụng Figma - công cụ thiết kế hàng đầu hiện nay. Bạn sẽ học từ nguyên tắc thiết kế cơ bản đến tạo prototype tương tác và bàn giao cho lập trình viên.',
    instructorId: 'ins3',
    price: 899000,
    discountPrice: 599000,
    thumbnail: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=600&h=340&fit=crop',
    category: 'Thiết kế',
    level: 'Cơ bản',
    duration: '28 giờ',
    totalLessons: 98,
    rating: 4.7,
    totalStudents: 5640,
    language: 'Tiếng Việt',
    tags: ['UI/UX', 'Figma', 'Design', 'Prototype'],
    lastUpdated: '2024-11-20',
    certificate: true,
    requirements: [
      'Không yêu cầu kinh nghiệm thiết kế trước',
      'Máy tính có kết nối internet',
    ],
    objectives: [
      'Nắm vững nguyên tắc thiết kế UI/UX',
      'Thành thạo công cụ Figma',
      'Tạo wireframe và prototype chuyên nghiệp',
      'Xây dựng Design System',
    ],
    chapters: [
      {
        id: 'ch3-1',
        title: 'Giới thiệu UI/UX Design',
        lessons: [
          { id: 'l3-1-1', title: 'UI vs UX - Sự khác biệt', type: 'video', duration: '15:00', description: 'Hiểu về UI và UX' },
          { id: 'l3-1-2', title: 'Nguyên tắc thiết kế cơ bản', type: 'video', duration: '20:00', description: 'Color, Typography, Layout' },
          { id: 'l3-1-3', title: 'Giới thiệu Figma', type: 'video', duration: '18:00', description: 'Interface và các công cụ cơ bản' },
        ],
      },
      {
        id: 'ch3-2',
        title: 'Wireframing',
        lessons: [
          { id: 'l3-2-1', title: 'Low-fidelity Wireframe', type: 'video', duration: '22:00', description: 'Phác thảo ý tưởng thiết kế' },
          { id: 'l3-2-2', title: 'High-fidelity Wireframe', type: 'video', duration: '30:00', description: 'Thiết kế chi tiết' },
          { id: 'l3-2-3', title: 'Bài tập Wireframe', type: 'exercise', duration: '60:00', description: 'Thiết kế app di động' },
        ],
      },
    ],
    reviews: [
      { id: 'r3-1', userId: 'u2', userName: 'Trần Thị Bích', userAvatar: '', rating: 5, comment: 'Tuyệt vời! Từ người không biết thiết kế giờ tôi đã có thể tạo ra những sản phẩm đẹp.', date: '2024-10-20' },
      { id: 'r3-2', userId: 'u5', userName: 'Đinh Văn Nam', userAvatar: '', rating: 4, comment: 'Nội dung thực tế, dễ áp dụng.', date: '2024-11-15' },
    ],
  },
  {
    id: 'c4',
    title: 'Marketing Số Toàn Diện',
    shortDesc: 'Học toàn bộ kỹ năng Digital Marketing từ SEO, SEM, Social Media đến Email Marketing và Analytics.',
    description: 'Khóa học Marketing Số toàn diện bao gồm tất cả các kênh và chiến lược marketing hiện đại. Từ SEO và Google Ads đến Social Media Marketing, Email Marketing, Content Marketing và phân tích dữ liệu.',
    instructorId: 'ins4',
    price: 799000,
    thumbnail: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&h=340&fit=crop',
    category: 'Marketing',
    level: 'Cơ bản',
    duration: '32 giờ',
    totalLessons: 112,
    rating: 4.6,
    totalStudents: 7890,
    language: 'Tiếng Việt',
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Google Ads'],
    lastUpdated: '2024-11-15',
    certificate: true,
    requirements: ['Không yêu cầu kiến thức marketing trước'],
    objectives: [
      'Xây dựng chiến lược Digital Marketing',
      'Thành thạo SEO và Google Ads',
      'Quản lý Social Media hiệu quả',
      'Đo lường và phân tích kết quả',
    ],
    chapters: [
      {
        id: 'ch4-1',
        title: 'Tổng quan Digital Marketing',
        lessons: [
          { id: 'l4-1-1', title: 'Digital Marketing là gì?', type: 'video', duration: '12:00', description: 'Tổng quan về marketing số' },
          { id: 'l4-1-2', title: 'Xây dựng Customer Persona', type: 'video', duration: '20:00', description: 'Hiểu khách hàng mục tiêu' },
          { id: 'l4-1-3', title: 'Content Marketing Strategy', type: 'video', duration: '25:00', description: 'Chiến lược nội dung' },
        ],
      },
    ],
    reviews: [
      { id: 'r4-1', userId: 'u3', userName: 'Lê Minh Tuấn', userAvatar: '', rating: 5, comment: 'Rất thực tế, nhiều ví dụ từ thị trường Việt Nam.', date: '2024-09-10' },
    ],
  },
  {
    id: 'c5',
    title: 'Lập Trình Flutter Mobile',
    shortDesc: 'Xây dựng ứng dụng di động cho iOS và Android với Flutter và Dart từ cơ bản đến nâng cao.',
    description: 'Học Flutter framework của Google để xây dựng ứng dụng mobile cross-platform. Bạn sẽ làm chủ Dart, Flutter widgets, state management, và tích hợp với backend APIs.',
    instructorId: 'ins1',
    price: 1199000,
    discountPrice: 899000,
    thumbnail: 'https://images.unsplash.com/photo-1744974086616-8cd4368609ba?w=600&h=340&fit=crop',
    category: 'Lập trình',
    level: 'Trung cấp',
    duration: '45 giờ',
    totalLessons: 165,
    rating: 4.8,
    totalStudents: 4320,
    language: 'Tiếng Việt',
    tags: ['Flutter', 'Dart', 'Mobile', 'iOS', 'Android'],
    lastUpdated: '2024-12-01',
    certificate: true,
    requirements: [
      'Kiến thức lập trình cơ bản (bất kỳ ngôn ngữ nào)',
      'Máy tính Mac, Windows hoặc Linux',
    ],
    objectives: [
      'Xây dựng ứng dụng Flutter từ đầu',
      'Hiểu kiến trúc Flutter và Dart',
      'Quản lý state với Provider, Riverpod',
      'Publish app lên App Store và Play Store',
    ],
    chapters: [
      {
        id: 'ch5-1',
        title: 'Bắt đầu với Flutter',
        lessons: [
          { id: 'l5-1-1', title: 'Cài đặt Flutter SDK', type: 'video', duration: '20:00', description: 'Thiết lập môi trường Flutter' },
          { id: 'l5-1-2', title: 'Ngôn ngữ Dart cơ bản', type: 'video', duration: '35:00', description: 'Cú pháp và kiểu dữ liệu Dart' },
          { id: 'l5-1-3', title: 'Flutter Widgets', type: 'video', duration: '30:00', description: 'StatelessWidget và StatefulWidget' },
        ],
      },
    ],
    reviews: [
      { id: 'r5-1', userId: 'u1', userName: 'Nguyễn Văn An', userAvatar: '', rating: 5, comment: 'Khóa học chất lượng cao, giảng viên tận tâm!', date: '2024-11-10' },
    ],
  },
  {
    id: 'c6',
    title: 'Machine Learning với TensorFlow',
    shortDesc: 'Xây dựng các mô hình Deep Learning và Machine Learning với TensorFlow và Keras.',
    description: 'Khóa học nâng cao về Machine Learning và Deep Learning sử dụng TensorFlow 2.x và Keras. Bao gồm mạng neural, CNN, RNN, LSTM và các kỹ thuật hiện đại nhất.',
    instructorId: 'ins2',
    price: 1499000,
    discountPrice: 999000,
    thumbnail: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=600&h=340&fit=crop',
    category: 'Data Science',
    level: 'Nâng cao',
    duration: '52 giờ',
    totalLessons: 188,
    rating: 4.9,
    totalStudents: 3890,
    language: 'Tiếng Việt',
    tags: ['TensorFlow', 'Deep Learning', 'Neural Network', 'Python'],
    lastUpdated: '2024-12-05',
    certificate: true,
    requirements: [
      'Kiến thức Python tốt',
      'Toán tuyến tính và xác suất thống kê',
      'Đã học Python cho Data Science',
    ],
    objectives: [
      'Hiểu sâu về Neural Networks',
      'Xây dựng mô hình CNN cho Computer Vision',
      'Làm việc với RNN và LSTM cho NLP',
      'Deploy mô hình ML lên production',
    ],
    chapters: [
      {
        id: 'ch6-1',
        title: 'Nền Tảng Machine Learning',
        lessons: [
          { id: 'l6-1-1', title: 'Giới thiệu ML và Deep Learning', type: 'video', duration: '25:00', description: 'Tổng quan về AI/ML' },
          { id: 'l6-1-2', title: 'TensorFlow 2.x cơ bản', type: 'video', duration: '30:00', description: 'Tensors và Operations' },
          { id: 'l6-1-3', title: 'Mạng Neural cơ bản', type: 'video', duration: '40:00', description: 'Feedforward Neural Networks' },
          { id: 'l6-1-4', title: 'Bài tập xây dựng mạng neural', type: 'exercise', duration: '60:00', description: 'Thực hành với dataset MNIST' },
        ],
      },
    ],
    reviews: [
      { id: 'r6-1', userId: 'u2', userName: 'Trần Thị Bích', userAvatar: '', rating: 5, comment: 'Đây là khóa học ML tốt nhất tôi từng học. Cực kỳ chi tiết!', date: '2024-10-30' },
    ],
  },
  {
    id: 'c7',
    title: 'Thiết Kế Đồ Họa với Photoshop',
    shortDesc: 'Học Photoshop từ cơ bản đến nâng cao để tạo ra các sản phẩm đồ họa chuyên nghiệp.',
    description: 'Khóa học Photoshop toàn diện từ giao diện cơ bản đến các kỹ thuật retouching, compositing và thiết kế đồ họa chuyên nghiệp. Phù hợp cho nhiếp ảnh gia, graphic designer và content creator.',
    instructorId: 'ins3',
    price: 699000,
    thumbnail: 'https://images.unsplash.com/photo-1740174459699-487aec1f7bc5?w=600&h=340&fit=crop',
    category: 'Thiết kế',
    level: 'Cơ bản',
    duration: '30 giờ',
    totalLessons: 108,
    rating: 4.7,
    totalStudents: 6120,
    language: 'Tiếng Việt',
    tags: ['Photoshop', 'Graphic Design', 'Photo Editing'],
    lastUpdated: '2024-11-01',
    certificate: true,
    requirements: ['Máy tính có cài Adobe Photoshop'],
    objectives: [
      'Làm chủ giao diện và công cụ Photoshop',
      'Kỹ thuật retouching ảnh chuyên nghiệp',
      'Tạo composite và hiệu ứng ấn tượng',
      'Thiết kế poster, banner và ấn phẩm',
    ],
    chapters: [
      {
        id: 'ch7-1',
        title: 'Làm quen với Photoshop',
        lessons: [
          { id: 'l7-1-1', title: 'Giao diện Photoshop', type: 'video', duration: '15:00', description: 'Khám phá workspace Photoshop' },
          { id: 'l7-1-2', title: 'Layers và Masks', type: 'video', duration: '25:00', description: 'Làm việc với layers' },
          { id: 'l7-1-3', title: 'Selection Tools', type: 'video', duration: '20:00', description: 'Các công cụ chọn vùng' },
        ],
      },
    ],
    reviews: [
      { id: 'r7-1', userId: 'u4', userName: 'Võ Thị Mai', userAvatar: '', rating: 5, comment: 'Giảng dạy rất rõ ràng, bài tập thực hành phong phú.', date: '2024-09-20' },
    ],
  },
  {
    id: 'c8',
    title: 'Blockchain và Web3 Development',
    shortDesc: 'Xây dựng ứng dụng phi tập trung (DApp) với Ethereum, Solidity và Web3.js.',
    description: 'Khóa học Blockchain và Web3 toàn diện từ cơ bản đến xây dựng DApp thực tế. Học Solidity để viết Smart Contracts, sử dụng Hardhat để test và deploy, tích hợp với MetaMask và Web3.js.',
    instructorId: 'ins5',
    price: 1399000,
    discountPrice: 1099000,
    thumbnail: 'https://images.unsplash.com/photo-1590285836796-f772deafabfc?w=600&h=340&fit=crop',
    category: 'Lập trình',
    level: 'Nâng cao',
    duration: '40 giờ',
    totalLessons: 142,
    rating: 4.8,
    totalStudents: 2890,
    language: 'Tiếng Việt',
    tags: ['Blockchain', 'Ethereum', 'Solidity', 'Web3'],
    lastUpdated: '2024-12-08',
    certificate: true,
    requirements: [
      'Kiến thức JavaScript tốt',
      'Hiểu về lập trình hướng đối tượng',
    ],
    objectives: [
      'Hiểu nguyên lý Blockchain',
      'Viết Smart Contracts với Solidity',
      'Xây dựng DApp với React và Web3.js',
      'Deploy lên Ethereum mainnet và testnet',
    ],
    chapters: [
      {
        id: 'ch8-1',
        title: 'Blockchain Fundamentals',
        lessons: [
          { id: 'l8-1-1', title: 'Blockchain là gì?', type: 'video', duration: '18:00', description: 'Nguyên lý hoạt động của Blockchain' },
          { id: 'l8-1-2', title: 'Ethereum và Smart Contracts', type: 'video', duration: '25:00', description: 'Giới thiệu về Ethereum' },
          { id: 'l8-1-3', title: 'Solidity cơ bản', type: 'video', duration: '35:00', description: 'Cú pháp ngôn ngữ Solidity' },
        ],
      },
    ],
    reviews: [
      { id: 'r8-1', userId: 'u5', userName: 'Đinh Văn Nam', userAvatar: '', rating: 5, comment: 'Khóa học rất hay, đúng với xu hướng công nghệ mới!', date: '2024-11-05' },
    ],
  },
  {
    id: 'c9',
    title: 'SQL và Cơ sở Dữ liệu',
    shortDesc: 'Học SQL từ cơ bản đến nâng cao, thiết kế database và tối ưu hóa hiệu suất truy vấn.',
    description: 'Khóa học SQL toàn diện từ câu lệnh cơ bản đến tối ưu hóa query phức tạp. Học thiết kế schema, indexing, transactions, stored procedures và làm việc với MySQL, PostgreSQL.',
    instructorId: 'ins5',
    price: 799000,
    discountPrice: 499000,
    thumbnail: 'https://images.unsplash.com/photo-1667264501379-c1537934c7ab?w=600&h=340&fit=crop',
    category: 'Lập trình',
    level: 'Cơ bản',
    duration: '25 giờ',
    totalLessons: 88,
    rating: 4.7,
    totalStudents: 9450,
    language: 'Tiếng Việt',
    tags: ['SQL', 'Database', 'MySQL', 'PostgreSQL'],
    lastUpdated: '2024-10-15',
    certificate: true,
    requirements: ['Không yêu cầu kiến thức trước'],
    objectives: [
      'Thành thạo SQL queries cơ bản và nâng cao',
      'Thiết kế database chuyên nghiệp',
      'Tối ưu hóa hiệu suất truy vấn',
      'Làm việc với MySQL và PostgreSQL',
    ],
    chapters: [
      {
        id: 'ch9-1',
        title: 'SQL Cơ Bản',
        lessons: [
          { id: 'l9-1-1', title: 'Database và SQL là gì?', type: 'video', duration: '12:00', description: 'Giới thiệu về cơ sở dữ liệu' },
          { id: 'l9-1-2', title: 'SELECT, FROM, WHERE', type: 'video', duration: '20:00', description: 'Câu lệnh truy vấn cơ bản' },
          { id: 'l9-1-3', title: 'JOIN các bảng', type: 'video', duration: '30:00', description: 'INNER, LEFT, RIGHT JOIN' },
          { id: 'l9-1-4', title: 'Bài tập SQL', type: 'exercise', duration: '45:00', description: 'Thực hành với database mẫu' },
          { id: 'l9-1-5', title: 'Quiz SQL cơ bản', type: 'quiz', duration: '20:00', description: 'Kiểm tra kiến thức SQL' },
        ],
      },
    ],
    reviews: [
      { id: 'r9-1', userId: 'u3', userName: 'Lê Minh Tuấn', userAvatar: '', rating: 5, comment: 'Từ người không biết gì về database, giờ tôi đã tự viết được query phức tạp!', date: '2024-09-15' },
    ],
  },
  {
    id: 'c10',
    title: 'Tiếng Anh Giao Tiếp',
    shortDesc: 'Nâng cao kỹ năng tiếng Anh giao tiếp trong môi trường công sở và quốc tế.',
    description: 'Khóa học Tiếng Anh giao tiếp chuyên sâu dành cho người đi làm. Học cách giao tiếp tự tin trong môi trường công sở, viết email chuyên nghiệp, thuyết trình và đàm phán bằng tiếng Anh.',
    instructorId: 'ins4',
    price: 599000,
    thumbnail: 'https://images.unsplash.com/photo-1673515334717-da4d85aaf38b?w=600&h=340&fit=crop',
    category: 'Ngoại ngữ',
    level: 'Trung cấp',
    duration: '20 giờ',
    totalLessons: 72,
    rating: 4.5,
    totalStudents: 11230,
    language: 'Tiếng Việt',
    tags: ['English', 'Communication', 'Business English'],
    lastUpdated: '2024-10-20',
    certificate: true,
    requirements: ['Tiếng Anh cơ bản (trình độ A2 trở lên)'],
    objectives: [
      'Giao tiếp tự tin bằng tiếng Anh',
      'Viết email và báo cáo chuyên nghiệp',
      'Thuyết trình trước đám đông',
      'Đàm phán và thương lượng bằng tiếng Anh',
    ],
    chapters: [
      {
        id: 'ch10-1',
        title: 'Giao tiếp cơ bản',
        lessons: [
          { id: 'l10-1-1', title: 'Giới thiệu bản thân', type: 'video', duration: '15:00', description: 'Self-introduction trong môi trường chuyên nghiệp' },
          { id: 'l10-1-2', title: 'Small Talk', type: 'video', duration: '18:00', description: 'Nghệ thuật nói chuyện phiếm' },
          { id: 'l10-1-3', title: 'Email chuyên nghiệp', type: 'video', duration: '22:00', description: 'Cấu trúc và ngôn ngữ email business' },
        ],
      },
    ],
    reviews: [
      { id: 'r10-1', userId: 'u4', userName: 'Võ Thị Mai', userAvatar: '', rating: 4, comment: 'Rất hữu ích cho công việc hàng ngày!', date: '2024-10-01' },
    ],
  },
  {
    id: 'c11',
    title: 'Quản Lý Dự Án Agile & Scrum',
    shortDesc: 'Học phương pháp Agile và Scrum để quản lý dự án phần mềm hiệu quả.',
    description: 'Khóa học toàn diện về Agile và Scrum - framework quản lý dự án phổ biến nhất trong ngành IT. Học cách tổ chức sprint, quản lý backlog, tổ chức daily standup và đo lường hiệu suất team.',
    instructorId: 'ins5',
    price: 899000,
    discountPrice: 699000,
    thumbnail: 'https://images.unsplash.com/photo-1758876202468-5ffe0ee61f07?w=600&h=340&fit=crop',
    category: 'Quản lý',
    level: 'Trung cấp',
    duration: '22 giờ',
    totalLessons: 80,
    rating: 4.6,
    totalStudents: 5670,
    language: 'Tiếng Việt',
    tags: ['Agile', 'Scrum', 'Project Management', 'Kanban'],
    lastUpdated: '2024-11-10',
    certificate: true,
    requirements: ['Kinh nghiệm làm việc trong team (bất kỳ lĩnh vực nào)'],
    objectives: [
      'Hiểu và áp dụng Agile Manifesto',
      'Triển khai Scrum framework hiệu quả',
      'Quản lý product backlog và sprint',
      'Chuẩn bị cho chứng chỉ Scrum Master',
    ],
    chapters: [
      {
        id: 'ch11-1',
        title: 'Agile Fundamentals',
        lessons: [
          { id: 'l11-1-1', title: 'Agile là gì?', type: 'video', duration: '15:00', description: 'Tư duy Agile và 12 nguyên tắc' },
          { id: 'l11-1-2', title: 'Scrum Framework', type: 'video', duration: '25:00', description: 'Roles, Events và Artifacts' },
          { id: 'l11-1-3', title: 'Sprint Planning', type: 'video', duration: '20:00', description: 'Lên kế hoạch sprint hiệu quả' },
          { id: 'l11-1-4', title: 'Bài tập Scrum', type: 'exercise', duration: '45:00', description: 'Mô phỏng Sprint thực tế' },
        ],
      },
    ],
    reviews: [
      { id: 'r11-1', userId: 'u1', userName: 'Nguyễn Văn An', userAvatar: '', rating: 5, comment: 'Áp dụng ngay vào công việc, team mình hiệu quả hơn rõ rệt!', date: '2024-10-05' },
    ],
  },
  {
    id: 'c12',
    title: 'DevOps và CI/CD Pipeline',
    shortDesc: 'Xây dựng pipeline CI/CD hoàn chỉnh với Docker, Kubernetes, Jenkins và các công cụ DevOps hiện đại.',
    description: 'Khóa học DevOps toàn diện bao gồm Docker, Kubernetes, Jenkins, GitLab CI, AWS/Azure. Học cách xây dựng và tự động hóa quy trình build, test và deploy ứng dụng.',
    instructorId: 'ins5',
    price: 1299000,
    discountPrice: 999000,
    thumbnail: 'https://images.unsplash.com/photo-1631624217902-d14c634ab17c?w=600&h=340&fit=crop',
    category: 'DevOps',
    level: 'Nâng cao',
    duration: '48 giờ',
    totalLessons: 172,
    rating: 4.8,
    totalStudents: 3450,
    language: 'Tiếng Việt',
    tags: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    lastUpdated: '2024-12-12',
    certificate: true,
    requirements: [
      'Kiến thức Linux cơ bản',
      'Biết lập trình (bất kỳ ngôn ngữ nào)',
      'Hiểu về version control với Git',
    ],
    objectives: [
      'Container hóa ứng dụng với Docker',
      'Orchestration với Kubernetes',
      'Xây dựng CI/CD pipeline hoàn chỉnh',
      'Monitor và logging hệ thống production',
    ],
    chapters: [
      {
        id: 'ch12-1',
        title: 'Docker Fundamentals',
        lessons: [
          { id: 'l12-1-1', title: 'Container vs VM', type: 'video', duration: '15:00', description: 'So sánh container và virtual machine' },
          { id: 'l12-1-2', title: 'Docker Images và Containers', type: 'video', duration: '25:00', description: 'Build và run Docker containers' },
          { id: 'l12-1-3', title: 'Docker Compose', type: 'video', duration: '30:00', description: 'Multi-container applications' },
          { id: 'l12-1-4', title: 'Bài tập Docker', type: 'exercise', duration: '60:00', description: 'Containerize một ứng dụng web' },
          { id: 'l12-1-5', title: 'Quiz Docker', type: 'quiz', duration: '20:00', description: 'Kiểm tra kiến thức Docker' },
        ],
      },
    ],
    reviews: [
      { id: 'r12-1', userId: 'u5', userName: 'Đinh Văn Nam', userAvatar: '', rating: 5, comment: 'Giảng viên có kinh nghiệm thực tế rất sâu. Học xong là làm được ngay!', date: '2024-11-25' },
    ],
  },
];

// ===================== USERS =====================
export const users: User[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@student.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
    role: 'student',
    joinedDate: '2024-01-15',
  },
  {
    id: 'admin1',
    name: 'Admin Hệ Thống',
    email: 'admin@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    role: 'admin',
    joinedDate: '2023-01-01',
  },
];

// ===================== INITIAL ENROLLMENTS =====================
export const initialEnrollments: Enrollment[] = [
  {
    id: 'enr1',
    userId: 'u1',
    courseId: 'c1',
    enrolledDate: '2024-10-01',
    completedLessons: ['l1-1-1', 'l1-1-2', 'l1-1-3', 'l1-2-1', 'l1-2-2', 'l1-2-3', 'l1-2-4', 'l1-2-5', 'l1-3-1', 'l1-3-2'],
    lastAccessedLesson: 'l1-3-2',
    completed: false,
  },
  {
    id: 'enr2',
    userId: 'u1',
    courseId: 'c2',
    enrolledDate: '2024-09-15',
    completedLessons: ['l2-1-1', 'l2-1-2', 'l2-1-3', 'l2-1-4', 'l2-2-1', 'l2-2-2', 'l2-2-3', 'l2-2-4', 'l2-2-5'],
    lastAccessedLesson: 'l2-2-5',
    completed: true,
    completedDate: '2024-11-20',
    grade: 92,
  },
  {
    id: 'enr3',
    userId: 'u1',
    courseId: 'c11',
    enrolledDate: '2024-11-01',
    completedLessons: ['l11-1-1', 'l11-1-2'],
    lastAccessedLesson: 'l11-1-2',
    completed: false,
  },
];

export const categories = [
  'Tất cả',
  'Lập trình',
  'Data Science',
  'Thiết kế',
  'Marketing',
  'DevOps',
  'Ngoại ngữ',
  'Quản lý',
];

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const getInstructor = (instructorId: string): Instructor | undefined => {
  return instructors.find(i => i.id === instructorId);
};

export const getCourse = (courseId: string): Course | undefined => {
  return courses.find(c => c.id === courseId);
};
