package com.edupro.controller;

import com.edupro.entity.LessonSubmission;
import com.edupro.entity.User;
import com.edupro.repository.*;
import com.edupro.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonSubmissionRepository submissionRepository;
    private final InstructorRepository instructorRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final GradingService gradingService;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        long courseCount = courseRepository.count();
        long studentCount = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.student).count();
        long enrollmentCount = enrollmentRepository.count();
        long completedCount = enrollmentRepository.countCompleted();

        // Estimate revenue: sum of effective prices from enrollments
        long revenue = enrollmentRepository.findAll().stream().mapToLong(e ->
            courseRepository.findById(e.getCourseId()).map(c ->
                (long)(c.getDiscountPrice() != null ? c.getDiscountPrice() : (c.getPrice() != null ? c.getPrice() : 0))
            ).orElse(0L)
        ).sum();

        // By category
        Map<String, long[]> byCatMap = new LinkedHashMap<>();
        courseRepository.findAll().forEach(c -> {
            String cat = c.getCategory() != null ? c.getCategory() : "Khác";
            byCatMap.computeIfAbsent(cat, k -> new long[]{0, 0});
            byCatMap.get(cat)[0]++;
            byCatMap.get(cat)[1] += c.getTotalStudents() != null ? c.getTotalStudents() : 0;
        });
        List<Map<String, Object>> byCategory = byCatMap.entrySet().stream().map(en -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", en.getKey());
            m.put("courses", en.getValue()[0]);
            m.put("students", en.getValue()[1]);
            return m;
        }).toList();

        // 6 months historical data
        LocalDate today = LocalDate.now();
        LocalDate sixMonthsAgo = today.minusMonths(5).withDayOfMonth(1);

        Map<String, long[]> monthlyMap = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate mDate = today.minusMonths(i);
            String label = "T" + mDate.getMonthValue();
            monthlyMap.put(label, new long[]{0, 0});
        }

        enrollmentRepository.findAll().forEach(e -> {
            if (e.getEnrolledDate() != null && !e.getEnrolledDate().isBefore(sixMonthsAgo)) {
                String label = "T" + e.getEnrolledDate().getMonthValue();
                if (monthlyMap.containsKey(label)) {
                    monthlyMap.get(label)[0]++; // enrollment count
                    long price = courseRepository.findById(e.getCourseId())
                            .map(c -> (long)(c.getDiscountPrice() != null ? c.getDiscountPrice() : (c.getPrice() != null ? c.getPrice() : 0)))
                            .orElse(0L);
                    monthlyMap.get(label)[1] += price; // revenue
                }
            }
        });

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : monthlyMap.entrySet()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", entry.getKey());
            m.put("enrollments", entry.getValue()[0]);
            m.put("revenue", entry.getValue()[1]);
            monthlyData.add(m);
        }

        return ResponseEntity.ok(Map.of(
            "courseCount", courseCount,
            "studentCount", studentCount,
            "enrollmentCount", enrollmentCount,
            "completedCount", completedCount,
            "estimatedRevenue", revenue,
            "byCategory", byCategory,
            "monthlyData", monthlyData
        ));
    }

    @GetMapping("/students-report")
    public ResponseEntity<?> studentsReport() {
        List<Map<String, Object>> out = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.student)
                .sorted(Comparator.comparing(User::getJoinedDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(u -> {
                    List<?> enrollments = enrollmentRepository.findByUserId(u.getId());
                    long completed = enrollmentRepository.findByUserId(u.getId()).stream()
                            .filter(e -> Boolean.TRUE.equals(e.getCompleted())).count();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getName());
                    m.put("email", u.getEmail());
                    m.put("avatar", u.getAvatar());
                    m.put("joinedDate", u.getJoinedDate() != null ? u.getJoinedDate().toString() : "");
                    m.put("enrolledCourses", enrollments.size());
                    m.put("completedCourses", completed);
                    m.put("totalTime", "—");
                    return m;
                }).toList();
        return ResponseEntity.ok(out);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String requestedEmail = body.get("email") != null
                ? String.valueOf(body.get("email")).trim().toLowerCase() : null;
        if (requestedEmail != null && (requestedEmail.isBlank() || !requestedEmail.contains("@"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "A valid email is required"));
        }
        if (requestedEmail != null && userRepository.findByEmail(requestedEmail)
                .filter(owner -> !owner.getId().equals(id)).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Email is already in use"));
        }
        return userRepository.findById(id).map(u -> {
            if (u.getRole() != User.Role.student) return ResponseEntity.badRequest().body(Map.of("error", "Not a student"));
            if (body.containsKey("name")) u.setName((String) body.get("name"));
            if (requestedEmail != null) u.setEmail(requestedEmail);
            if (body.containsKey("avatar")) u.setAvatar((String) body.get("avatar"));
            if (body.containsKey("password") && body.get("password") != null && !((String)body.get("password")).isBlank()) {
                if (((String) body.get("password")).length() < 8) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Password must have at least 8 characters"));
                }
                u.setPasswordHash(passwordEncoder.encode((String) body.get("password")));
            }
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/students/{id}")
    @Transactional
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        return userRepository.findById(id).map(u -> {
            if (u.getRole() != User.Role.student) return ResponseEntity.badRequest().body(Map.of("error", "Not a student"));
            enrollmentRepository.deleteByUserId(id);
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/submissions")
    public ResponseEntity<?> submissions(@RequestParam(required = false) String courseId) {
        List<LessonSubmission> subs = courseId != null && !courseId.isBlank()
                ? submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                : submissionRepository.findAllByOrderBySubmittedAtDesc();

        List<Map<String, Object>> out = subs.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("userId", s.getUserId());
            m.put("courseId", s.getCourseId());
            m.put("lessonId", s.getLessonId());
            m.put("content", s.getContent());
            m.put("score", s.getScore());
            m.put("feedback", s.getFeedback());
            m.put("submittedAt", s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : "");
            m.put("gradedAt", s.getGradedAt() != null ? s.getGradedAt().toString() : null);
            // Fetch userName and courseTitle
            userRepository.findById(s.getUserId()).ifPresent(u -> {
                m.put("userName", u.getName());
                m.put("avatar", u.getAvatar());
            });
            courseRepository.findById(s.getCourseId()).ifPresent(c -> m.put("courseTitle", c.getTitle()));
            return m;
        }).toList();

        return ResponseEntity.ok(out);
    }

    @PatchMapping("/submissions/{id}")
    public ResponseEntity<?> gradeSubmission(@PathVariable String id,
                                              @RequestBody Map<String, Object> body) {
        return submissionRepository.findById(id).map(s -> {
            Object scoreValue = body.get("score");
            if (!(scoreValue instanceof Number score)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Score is required"));
            }
            Object feedbackValue = body.get("feedback");
            String feedback = feedbackValue != null ? String.valueOf(feedbackValue).trim() : null;
            if (feedback != null && feedback.length() > 5000) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback is too long"));
            }
            return ResponseEntity.ok(gradingService.grade(s, score.intValue(), feedback));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/instructors")
    @Transactional
    public ResponseEntity<?> createInstructor(@RequestBody Map<String, Object> payload) {
        String id = "ins_" + UUID.randomUUID();
        String name = (String) payload.get("name");
        String email = payload.get("email") != null ? String.valueOf(payload.get("email")).trim().toLowerCase() : null;
        String password = (String) payload.get("password");
        
        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body("Thiếu thông tin bắt buộc (name, email, password)");
        }
        if (name.isBlank() || !email.contains("@") || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, valid email, and password of at least 8 characters are required"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email đã tồn tại");
        }

        // Tạo User để đăng nhập
        User u = new User();
        u.setId(id);
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setAvatar((String) payload.getOrDefault("avatar", "https://api.dicebear.com/7.x/avataaars/svg?seed=" + id));
        u.setRole(User.Role.instructor);
        u.setJoinedDate(LocalDate.now());
        userRepository.save(u);

        // Tạo record Instructor
        com.edupro.entity.Instructor ins = new com.edupro.entity.Instructor();
        ins.setId(id);
        ins.setName(name);
        ins.setEmail(email);
        ins.setAvatar((String) payload.getOrDefault("avatar", ""));
        ins.setBio((String) payload.getOrDefault("bio", ""));
        ins.setSpecialty((String) payload.getOrDefault("specialty", "Lập trình Web"));
        ins.setExperience((String) payload.getOrDefault("experience", "0 năm"));
        ins.setRating(java.math.BigDecimal.valueOf(5.0));
        ins.setStudents(0);
        instructorRepository.save(ins);

        return ResponseEntity.ok(ins);
    }

    @PutMapping("/instructors/{id}")
    public ResponseEntity<?> updateInstructor(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        String requestedEmail = payload.get("email") != null
                ? String.valueOf(payload.get("email")).trim().toLowerCase() : null;
        if (requestedEmail != null && userRepository.findByEmail(requestedEmail)
                .filter(owner -> !owner.getId().equals(id)).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Email is already in use"));
        }
        return instructorRepository.findById(id).map(ins -> {
            if (payload.containsKey("name")) ins.setName((String) payload.get("name"));
            if (payload.containsKey("avatar")) ins.setAvatar((String) payload.get("avatar"));
            if (payload.containsKey("bio")) ins.setBio((String) payload.get("bio"));
            if (payload.containsKey("specialty")) ins.setSpecialty((String) payload.get("specialty"));
            if (payload.containsKey("experience")) ins.setExperience((String) payload.get("experience"));
            if (requestedEmail != null) ins.setEmail(requestedEmail);
            instructorRepository.save(ins);

            // Cập nhật User tương ứng
            userRepository.findById(id).ifPresent(u -> {
                if (payload.containsKey("name")) u.setName((String) payload.get("name"));
                if (payload.containsKey("avatar")) u.setAvatar((String) payload.get("avatar"));
                if (requestedEmail != null) u.setEmail(requestedEmail);
                if (payload.get("password") instanceof String password && !password.isBlank()) {
                    if (password.length() < 8) throw new IllegalArgumentException("Password must have at least 8 characters");
                    u.setPasswordHash(passwordEncoder.encode((String) payload.get("password")));
                }
                userRepository.save(u);
            });

            return ResponseEntity.ok(ins);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/instructors/{id}")
    @Transactional
    public ResponseEntity<?> deleteInstructor(@PathVariable String id) {
        if (!instructorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (courseRepository.existsByInstructorId(id)) {
            return ResponseEntity.status(409)
                    .body(Map.of("error", "Cannot delete an instructor who still owns courses"));
        }
        instructorRepository.deleteById(id);
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** Sync: tạo User record cho các Instructor bị thiếu (orphaned) */
    @PostMapping("/instructors/sync")
    @Transactional
    public ResponseEntity<?> syncInstructorUsers(@RequestBody(required = false) Map<String, Object> body) {
        String defaultPassword = body != null && body.get("defaultPassword") instanceof String password
                ? password : "";
        if (defaultPassword.length() < 12) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "A defaultPassword of at least 12 characters is required"));
        }

        List<com.edupro.entity.Instructor> allInstructors = instructorRepository.findAll();
        List<Map<String, String>> synced = new ArrayList<>();

        for (com.edupro.entity.Instructor ins : allInstructors) {
            if (!userRepository.existsById(ins.getId())) {
                User u = new User();
                u.setId(ins.getId());
                u.setName(ins.getName());
                u.setEmail(ins.getEmail());
                u.setPasswordHash(passwordEncoder.encode(defaultPassword));
                u.setAvatar(ins.getAvatar() != null && !ins.getAvatar().isBlank()
                        ? ins.getAvatar()
                        : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + ins.getId());
                u.setRole(User.Role.instructor);
                u.setJoinedDate(LocalDate.now());
                userRepository.save(u);
                synced.add(Map.of("id", ins.getId(), "email", ins.getEmail()));
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Đã đồng bộ " + synced.size() + " giảng viên",
            "synced", synced
        ));
    }
}
