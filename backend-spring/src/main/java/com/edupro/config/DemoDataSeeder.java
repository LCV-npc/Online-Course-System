package com.edupro.config;

import com.edupro.entity.Course;
import com.edupro.entity.Instructor;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.InstructorRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    private static final String JAVA_INSTRUCTOR_ID = "demo_ins_minh_khoa";
    private static final String DEVOPS_INSTRUCTOR_ID = "demo_ins_thu_ha";

    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.seed-demo.enabled:false}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            log.info("Demo course seeding is disabled");
            return;
        }

        createInstructors();

        int created = 0;
        created += saveIfMissing(javaSpringBootCourse());
        created += saveIfMissing(reactTypeScriptCourse());
        created += saveIfMissing(mysqlCourse());
        created += saveIfMissing(devOpsCourse());

        log.info("Demo course seed finished: {} new course(s) created", created);
    }

    private void createInstructors() {
        if (!instructorRepository.existsById(JAVA_INSTRUCTOR_ID)) {
            Instructor instructor = new Instructor();
            instructor.setId(JAVA_INSTRUCTOR_ID);
            instructor.setName("Nguyễn Minh Khoa");
            instructor.setEmail("minh.khoa.demo@example.local");
            instructor.setAvatar("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face");
            instructor.setBio("Kỹ sư phần mềm chuyên xây dựng ứng dụng web và hệ thống backend Java.");
            instructor.setSpecialty("Java, Spring Boot, React, SQL");
            instructor.setRating(new BigDecimal("4.9"));
            instructor.setStudents(1280);
            instructor.setExperience("9 năm");
            instructorRepository.save(instructor);
        }

        if (!instructorRepository.existsById(DEVOPS_INSTRUCTOR_ID)) {
            Instructor instructor = new Instructor();
            instructor.setId(DEVOPS_INSTRUCTOR_ID);
            instructor.setName("Trần Thu Hà");
            instructor.setEmail("thu.ha.demo@example.local");
            instructor.setAvatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face");
            instructor.setBio("DevOps Engineer tập trung vào container, CI/CD và vận hành hệ thống cloud.");
            instructor.setSpecialty("Docker, CI/CD, Cloud, Linux");
            instructor.setRating(new BigDecimal("4.8"));
            instructor.setStudents(940);
            instructor.setExperience("7 năm");
            instructorRepository.save(instructor);
        }
    }

    private int saveIfMissing(Course course) {
        if (courseRepository.existsById(course.getId())) {
            return 0;
        }
        courseRepository.save(course);
        return 1;
    }

    private Course javaSpringBootCourse() {
        return course(
                "demo_it_spring_boot",
                "Xây dựng REST API với Java Spring Boot",
                "Tạo backend thực tế với Spring Boot, JPA, MySQL, validation và JWT.",
                "Khóa học hướng dẫn xây dựng REST API có kiến trúc rõ ràng, kết nối MySQL, xác thực JWT và xử lý lỗi thống nhất.",
                JAVA_INSTRUCTOR_ID,
                1_299_000,
                799_000,
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=510&fit=crop",
                "Lập trình",
                "Trung cấp",
                "18 giờ",
                new BigDecimal("4.9"),
                680,
                List.of("Java", "Spring Boot", "REST API", "JWT", "MySQL"),
                List.of("Biết Java cơ bản", "Máy tính đã cài JDK 17 và IntelliJ IDEA"),
                List.of(
                        "Thiết kế REST API theo mô hình nhiều lớp",
                        "Làm việc với Spring Data JPA và MySQL",
                        "Bảo vệ API bằng Spring Security và JWT",
                        "Đóng gói một backend sẵn sàng để demo"
                ),
                List.of(
                        chapter("demo_sb_ch1", "Khởi tạo dự án Spring Boot", List.of(
                                documentLesson("demo_sb_l1", "Kiến trúc một ứng dụng Spring Boot", "12 phút",
                                        "Tìm hiểu vai trò của Controller, Service, Repository và Entity.",
                                        "# Kiến trúc ứng dụng\nRequest đi qua Controller, Service rồi tới Repository. Mỗi lớp chỉ đảm nhận một trách nhiệm rõ ràng."),
                                documentLesson("demo_sb_l2", "Tạo REST Controller đầu tiên", "18 phút",
                                        "Xây dựng endpoint GET và POST cơ bản.",
                                        "# REST Controller\nSử dụng @RestController, @RequestMapping, @GetMapping và @PostMapping để khai báo API."),
                                quizLesson("demo_sb_l3", "Kiểm tra kiến thức Spring Boot", "10 phút",
                                        "Annotation nào đánh dấu một REST controller?",
                                        List.of("@Service", "@Repository", "@RestController", "@Entity"), 2)
                        )),
                        chapter("demo_sb_ch2", "Dữ liệu và bảo mật", List.of(
                                documentLesson("demo_sb_l4", "Kết nối MySQL với Spring Data JPA", "25 phút",
                                        "Cấu hình datasource, entity và repository.",
                                        "# Spring Data JPA\nKhai báo Entity ánh xạ bảng và JpaRepository để thực hiện các thao tác CRUD."),
                                documentLesson("demo_sb_l5", "Xác thực bằng JWT", "28 phút",
                                        "Hiểu quy trình đăng nhập, tạo token và kiểm tra token.",
                                        "# JWT\nSau khi đăng nhập thành công, server ký token. Client gửi token trong header Authorization cho các yêu cầu tiếp theo."),
                                exerciseLesson("demo_sb_l6", "Bài tập: API quản lý công việc", "45 phút",
                                        "Tạo API CRUD cho Task gồm tiêu đề, trạng thái và ngày hết hạn.")
                        ))
                )
        );
    }

    private Course reactTypeScriptCourse() {
        return course(
                "demo_it_react_typescript",
                "React và TypeScript từ cơ bản đến dự án",
                "Làm chủ component, hooks, kiểu dữ liệu và xây dựng giao diện React hiện đại.",
                "Học React cùng TypeScript qua một dự án dashboard, từ component đầu tiên đến quản lý state và gọi REST API.",
                JAVA_INSTRUCTOR_ID,
                999_000,
                599_000,
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&h=510&fit=crop",
                "Lập trình",
                "Cơ bản",
                "15 giờ",
                new BigDecimal("4.8"),
                920,
                List.of("React", "TypeScript", "Frontend", "Vite"),
                List.of("Biết HTML, CSS và JavaScript cơ bản", "Máy tính đã cài Node.js"),
                List.of(
                        "Xây dựng component React có thể tái sử dụng",
                        "Khai báo props và state an toàn với TypeScript",
                        "Gọi API và xử lý trạng thái tải/lỗi",
                        "Hoàn thiện một dashboard responsive"
                ),
                List.of(
                        chapter("demo_react_ch1", "Nền tảng React và TypeScript", List.of(
                                documentLesson("demo_react_l1", "Khởi tạo dự án bằng Vite", "12 phút",
                                        "Tạo và tìm hiểu cấu trúc dự án React TypeScript.",
                                        "# Vite + React\nKhởi tạo dự án, tìm hiểu src, component gốc và cơ chế hot reload."),
                                documentLesson("demo_react_l2", "Component, Props và Interface", "22 phút",
                                        "Mô hình hóa dữ liệu đầu vào của component.",
                                        "# Props có kiểu\nDùng interface để mô tả props giúp IDE tự động gợi ý và phát hiện lỗi sớm."),
                                quizLesson("demo_react_l3", "Quiz React căn bản", "10 phút",
                                        "Hook nào dùng để lưu state cục bộ?",
                                        List.of("useMemo", "useState", "useEffect", "useRef"), 1)
                        )),
                        chapter("demo_react_ch2", "Hooks và tích hợp API", List.of(
                                documentLesson("demo_react_l4", "useEffect và vòng đời dữ liệu", "25 phút",
                                        "Tải dữ liệu và dọn dẹp side effect đúng cách.",
                                        "# useEffect\nEffect chạy sau khi render. Dependency array quyết định thời điểm effect được chạy lại."),
                                documentLesson("demo_react_l5", "Gọi REST API an toàn", "24 phút",
                                        "Xử lý loading, error và dữ liệu trả về.",
                                        "# Gọi API\nLuôn kiểm tra HTTP status, hiển thị loading và cung cấp thông báo lỗi thân thiện."),
                                exerciseLesson("demo_react_l6", "Bài tập: Dashboard khóa học", "60 phút",
                                        "Xây dựng trang danh sách khóa học có tìm kiếm, lọc và trạng thái tải dữ liệu.")
                        ))
                )
        );
    }

    private Course mysqlCourse() {
        return course(
                "demo_it_mysql",
                "SQL và MySQL thực chiến cho lập trình viên",
                "Thiết kế cơ sở dữ liệu, viết truy vấn SQL và tối ưu các thao tác phổ biến.",
                "Khóa học thực hành từ mô hình quan hệ đến JOIN, GROUP BY, transaction và index trong MySQL.",
                JAVA_INSTRUCTOR_ID,
                799_000,
                449_000,
                "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900&h=510&fit=crop",
                "Data Science",
                "Cơ bản",
                "12 giờ",
                new BigDecimal("4.7"),
                740,
                List.of("SQL", "MySQL", "Database", "Backend"),
                List.of("Không yêu cầu kinh nghiệm cơ sở dữ liệu", "Có MySQL 8 hoặc MySQL Workbench"),
                List.of(
                        "Thiết kế bảng và quan hệ hợp lý",
                        "Viết truy vấn JOIN và thống kê dữ liệu",
                        "Sử dụng transaction để bảo toàn dữ liệu",
                        "Nhận biết trường hợp cần tạo index"
                ),
                List.of(
                        chapter("demo_sql_ch1", "SQL nền tảng", List.of(
                                documentLesson("demo_sql_l1", "Bảng, khóa chính và khóa ngoại", "20 phút",
                                        "Hiểu cách các bảng liên kết trong mô hình quan hệ.",
                                        "# Mô hình quan hệ\nKhóa chính định danh bản ghi; khóa ngoại bảo đảm mối liên hệ hợp lệ giữa các bảng."),
                                documentLesson("demo_sql_l2", "SELECT, WHERE và ORDER BY", "25 phút",
                                        "Truy vấn và sắp xếp dữ liệu theo điều kiện.",
                                        "# SELECT\nChỉ lấy các cột cần thiết, lọc bằng WHERE và sắp xếp kết quả bằng ORDER BY."),
                                quizLesson("demo_sql_l3", "Quiz SQL cơ bản", "10 phút",
                                        "Mệnh đề nào dùng để lọc từng hàng?",
                                        List.of("ORDER BY", "WHERE", "GROUP BY", "LIMIT"), 1)
                        )),
                        chapter("demo_sql_ch2", "Truy vấn và tối ưu", List.of(
                                documentLesson("demo_sql_l4", "JOIN nhiều bảng", "30 phút",
                                        "Kết hợp dữ liệu bằng INNER JOIN và LEFT JOIN.",
                                        "# JOIN\nINNER JOIN chỉ trả về phần khớp; LEFT JOIN giữ toàn bộ hàng của bảng bên trái."),
                                documentLesson("demo_sql_l5", "Transaction và Index", "28 phút",
                                        "Bảo toàn dữ liệu và cải thiện tốc độ truy vấn.",
                                        "# Transaction và Index\nTransaction nhóm các thay đổi thành một đơn vị. Index tăng tốc đọc nhưng làm tăng chi phí ghi."),
                                exerciseLesson("demo_sql_l6", "Bài tập: Cơ sở dữ liệu bán hàng", "50 phút",
                                        "Thiết kế bảng khách hàng, sản phẩm, đơn hàng và viết truy vấn tính doanh thu.")
                        ))
                )
        );
    }

    private Course devOpsCourse() {
        return course(
                "demo_it_devops",
                "Docker và CI/CD cho dự án Web",
                "Đóng gói ứng dụng bằng Docker và tự động hóa kiểm thử, build, triển khai.",
                "Khóa học thực hành container hóa frontend/backend, dùng Docker Compose và thiết kế pipeline CI/CD cơ bản.",
                DEVOPS_INSTRUCTOR_ID,
                1_199_000,
                699_000,
                "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=900&h=510&fit=crop",
                "DevOps",
                "Trung cấp",
                "14 giờ",
                new BigDecimal("4.8"),
                510,
                List.of("Docker", "CI/CD", "DevOps", "Linux", "Deployment"),
                List.of("Biết sử dụng terminal cơ bản", "Đã từng chạy một dự án web"),
                List.of(
                        "Tạo Dockerfile tối ưu cho ứng dụng web",
                        "Kết nối nhiều service bằng Docker Compose",
                        "Tự động chạy test và build trong pipeline",
                        "Quản lý biến môi trường khi triển khai"
                ),
                List.of(
                        chapter("demo_devops_ch1", "Nền tảng Docker", List.of(
                                documentLesson("demo_devops_l1", "Image, Container và Registry", "20 phút",
                                        "Phân biệt các thành phần cốt lõi của Docker.",
                                        "# Docker\nImage là mẫu bất biến; container là một tiến trình được tạo từ image; registry lưu và phân phối image."),
                                documentLesson("demo_devops_l2", "Viết Dockerfile", "30 phút",
                                        "Đóng gói ứng dụng theo hướng cache hiệu quả.",
                                        "# Dockerfile\nChọn base image nhỏ, sao chép file dependency trước và dùng multi-stage build khi phù hợp."),
                                quizLesson("demo_devops_l3", "Quiz Docker", "10 phút",
                                        "Tệp nào mô tả cách tạo một Docker image?",
                                        List.of("compose.json", "Dockerfile", "package.json", "pipeline.yml"), 1)
                        )),
                        chapter("demo_devops_ch2", "Compose và CI/CD", List.of(
                                documentLesson("demo_devops_l4", "Docker Compose nhiều service", "28 phút",
                                        "Chạy frontend, backend và database cùng nhau.",
                                        "# Docker Compose\nKhai báo service, network, volume và biến môi trường trong một tệp cấu hình."),
                                documentLesson("demo_devops_l5", "Pipeline kiểm thử và build", "32 phút",
                                        "Thiết kế các bước kiểm tra trước khi triển khai.",
                                        "# CI/CD\nMột pipeline cơ bản gồm cài dependency, chạy test, build artifact và triển khai theo môi trường."),
                                exerciseLesson("demo_devops_l6", "Bài tập: Container hóa hệ thống", "60 phút",
                                        "Viết Dockerfile và compose cho một frontend, một Spring Boot API và MySQL.")
                        ))
                )
        );
    }

    private Course course(
            String id,
            String title,
            String shortDesc,
            String description,
            String instructorId,
            int price,
            Integer discountPrice,
            String thumbnail,
            String category,
            String level,
            String duration,
            BigDecimal rating,
            int totalStudents,
            List<String> tags,
            List<String> requirements,
            List<String> objectives,
            List<Map<String, Object>> chapters
    ) {
        Course course = new Course();
        course.setId(id);
        course.setTitle(title);
        course.setShortDesc(shortDesc);
        course.setDescription(description);
        course.setInstructorId(instructorId);
        course.setPrice(price);
        course.setDiscountPrice(discountPrice);
        course.setThumbnail(thumbnail);
        course.setCategory(category);
        course.setLevel(level);
        course.setDuration(duration);
        course.setTotalLessons(chapters.stream()
                .mapToInt(chapter -> ((List<?>) chapter.get("lessons")).size())
                .sum());
        course.setRating(rating);
        course.setTotalStudents(totalStudents);
        course.setLanguage("Tiếng Việt");
        course.setTags(json(tags));
        course.setChapters(json(chapters));
        course.setReviews("[]");
        course.setRequirements(json(requirements));
        course.setObjectives(json(objectives));
        course.setLastUpdated(LocalDate.now());
        course.setCertificate(true);
        return course;
    }

    private Map<String, Object> chapter(String id, String title, List<Map<String, Object>> lessons) {
        Map<String, Object> chapter = new LinkedHashMap<>();
        chapter.put("id", id);
        chapter.put("title", title);
        chapter.put("lessons", lessons);
        return chapter;
    }

    private Map<String, Object> documentLesson(
            String id, String title, String duration, String description, String documentContent) {
        Map<String, Object> lesson = baseLesson(id, title, "document", duration, description);
        lesson.put("documentContent", documentContent);
        return lesson;
    }

    private Map<String, Object> exerciseLesson(
            String id, String title, String duration, String exercisePrompt) {
        Map<String, Object> lesson = baseLesson(id, title, "exercise", duration, exercisePrompt);
        lesson.put("exercisePrompt", exercisePrompt);
        return lesson;
    }

    private Map<String, Object> quizLesson(
            String id,
            String title,
            String duration,
            String questionText,
            List<String> options,
            int correctAnswerIndex
    ) {
        Map<String, Object> lesson = baseLesson(id, title, "quiz", duration, "Câu hỏi ôn tập cuối chương.");
        Map<String, Object> question = new LinkedHashMap<>();
        question.put("id", id + "_q1");
        question.put("questionText", questionText);
        question.put("options", options);
        question.put("correctAnswerIndex", correctAnswerIndex);
        lesson.put("questions", List.of(question));
        return lesson;
    }

    private Map<String, Object> baseLesson(
            String id, String title, String type, String duration, String description) {
        Map<String, Object> lesson = new LinkedHashMap<>();
        lesson.put("id", id);
        lesson.put("title", title);
        lesson.put("type", type);
        lesson.put("duration", duration);
        lesson.put("description", description);
        return lesson;
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize demo course data", exception);
        }
    }
}
