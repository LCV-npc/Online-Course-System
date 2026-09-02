package com.edupro.controller;

import com.edupro.entity.Course;
import com.edupro.entity.Enrollment;
import com.edupro.entity.LessonSubmission;
import com.edupro.entity.User;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.InstructorRepository;
import com.edupro.repository.LessonSubmissionRepository;
import com.edupro.repository.CourseRepository;
import com.edupro.service.CourseResponseMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final LessonSubmissionRepository lessonSubmissionRepository;
    private final InstructorRepository instructorRepository;
    private final ObjectMapper objectMapper;
    private final CourseResponseMapper courseResponseMapper;

    @GetMapping("/me")
    public ResponseEntity<?> myEnrollments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(enrollmentRepository.findByUserId(user.getId())
                .stream().map(this::toMap).toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> enroll(@RequestBody Map<String, Object> body,
                                    @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.student) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only students can enroll in courses"));
        }

        String courseId = body.get("courseId") != null ? String.valueOf(body.get("courseId")) : "";
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You are already enrolled in this course"));
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setId("enr_" + UUID.randomUUID());
        enrollment.setUserId(user.getId());
        enrollment.setCourseId(courseId);
        enrollment.setEnrolledDate(LocalDate.now());
        enrollment.setCompletedLessons("[]");
        enrollment.setLastAccessedLesson("");
        enrollment.setCompleted(false);
        enrollmentRepository.save(enrollment);

        course.setTotalStudents((course.getTotalStudents() != null ? course.getTotalStudents() : 0) + 1);
        courseRepository.save(course);
        if (course.getInstructorId() != null) {
            instructorRepository.findById(course.getInstructorId()).ifPresent(instructor -> {
                instructor.setStudents((instructor.getStudents() != null ? instructor.getStudents() : 0) + 1);
                instructorRepository.save(instructor);
            });
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(enrollment));
    }

    @GetMapping("/{courseId}/content")
    public ResponseEntity<?> courseContent(@PathVariable String courseId,
                                           @AuthenticationPrincipal User user) {
        return courseRepository.findById(courseId).map(course -> {
            boolean allowed = user.getRole() == User.Role.admin
                    || (user.getRole() == User.Role.instructor && user.getId().equals(course.getInstructorId()))
                    || enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId);
            if (!allowed) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not allowed to access this course content"));
            }
            return ResponseEntity.ok(courseResponseMapper.toMap(course, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{courseId}")
    @Transactional
    public ResponseEntity<?> updateProgress(@PathVariable String courseId,
                                            @RequestBody Map<String, Object> body,
                                            @AuthenticationPrincipal User user) {
        if (body.containsKey("completed") || body.containsKey("grade") || body.containsKey("completedDate")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Completion and grade can only be set by an authorized grader"));
        }

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();
        Set<String> validLessonIds = lessonIds(course);

        return enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId).map(enrollment -> {
            if (body.containsKey("completedLessons")) {
                if (!(body.get("completedLessons") instanceof List<?> submittedIds)
                        || submittedIds.stream().anyMatch(id -> !(id instanceof String) || !validLessonIds.contains(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "completedLessons contains an invalid lesson id"));
                }
                List<String> distinctIds = submittedIds.stream().map(String.class::cast).distinct().toList();
                enrollment.setCompletedLessons(writeJson(distinctIds));
            }

            if (body.containsKey("lastAccessedLesson")) {
                String lessonId = body.get("lastAccessedLesson") != null
                        ? String.valueOf(body.get("lastAccessedLesson")) : "";
                if (!lessonId.isEmpty() && !validLessonIds.contains(lessonId)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "lastAccessedLesson is invalid"));
                }
                enrollment.setLastAccessedLesson(lessonId);
            }

            enrollmentRepository.save(enrollment);
            return ResponseEntity.ok(toMap(enrollment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/admin/{enrollmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminUpdate(@PathVariable String enrollmentId,
                                         @RequestBody Map<String, Object> body) {
        return enrollmentRepository.findById(enrollmentId).map(enrollment -> {
            if (body.containsKey("grade")) {
                Object value = body.get("grade");
                if (value != null && (!(value instanceof Number) || ((Number) value).intValue() < 0
                        || ((Number) value).intValue() > 100)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Grade must be between 0 and 100"));
                }
                enrollment.setGrade(value == null ? null : ((Number) value).intValue());
            }
            if (body.containsKey("completed")) {
                if (!(body.get("completed") instanceof Boolean completed)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "completed must be a boolean"));
                }
                enrollment.setCompleted(completed);
                enrollment.setCompletedDate(completed ? LocalDate.now() : null);
            }
            enrollmentRepository.save(enrollment);
            return ResponseEntity.ok(toMap(enrollment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/submit")
    public ResponseEntity<?> submitLesson(@PathVariable String courseId,
                                          @PathVariable String lessonId,
                                          @RequestBody Map<String, Object> body,
                                          @AuthenticationPrincipal User user) {
        if (!enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not enrolled in this course"));
        }
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();
        if (!lessonIds(course).contains(lessonId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lesson does not belong to this course"));
        }
        if (lessonSubmissionRepository.existsByUserIdAndCourseIdAndLessonId(user.getId(), courseId, lessonId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "This lesson was already submitted"));
        }

        String content = body.get("content") != null ? String.valueOf(body.get("content")).trim() : "";
        if (content.isBlank() || content.length() > 10000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Submission content must contain 1 to 10000 characters"));
        }

        LessonSubmission submission = new LessonSubmission();
        submission.setId("sub_" + UUID.randomUUID());
        submission.setUserId(user.getId());
        submission.setCourseId(courseId);
        submission.setLessonId(lessonId);
        submission.setContent(content);
        submission.setSubmittedAt(LocalDateTime.now());
        lessonSubmissionRepository.save(submission);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", submission.getId(), "message", "Submission received"));
    }

    @PostMapping("/{courseId}/submit-for-grading")
    public ResponseEntity<?> submitForGrading(@PathVariable String courseId,
                                               @RequestBody(required = false) Map<String, Object> body,
                                               @AuthenticationPrincipal User user) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId).orElse(null);
        if (enrollment == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not enrolled in this course"));
        }
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();

        Set<String> requiredLessonIds = lessonIds(course);
        Set<String> completedLessonIds = new HashSet<>(parseList(enrollment.getCompletedLessons()).stream()
                .filter(String.class::isInstance).map(String.class::cast).toList());
        if (requiredLessonIds.isEmpty() || !completedLessonIds.containsAll(requiredLessonIds)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "All course lessons must be completed before requesting grading"));
        }
        if (lessonSubmissionRepository.existsByUserIdAndCourseIdAndLessonId(
                user.getId(), courseId, "course_completion")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "A grading request already exists"));
        }

        LessonSubmission submission = new LessonSubmission();
        submission.setId("sub_" + UUID.randomUUID());
        submission.setUserId(user.getId());
        submission.setCourseId(courseId);
        submission.setLessonId("course_completion");
        Object content = body != null ? body.get("content") : null;
        submission.setContent(content != null ? String.valueOf(content) : "All lessons completed; grading requested.");
        submission.setSubmittedAt(LocalDateTime.now());
        lessonSubmissionRepository.save(submission);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", submission.getId(), "message", "Grading request received"));
    }

    private Map<String, Object> toMap(Enrollment enrollment) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", enrollment.getId());
        result.put("userId", enrollment.getUserId());
        result.put("courseId", enrollment.getCourseId());
        result.put("enrolledDate", enrollment.getEnrolledDate() != null ? enrollment.getEnrolledDate().toString() : "");
        result.put("completedLessons", parseList(enrollment.getCompletedLessons()));
        result.put("lastAccessedLesson", enrollment.getLastAccessedLesson());
        result.put("completed", enrollment.getCompleted());
        result.put("completedDate", enrollment.getCompletedDate() != null ? enrollment.getCompletedDate().toString() : null);
        result.put("grade", enrollment.getGrade());
        return result;
    }

    private List<?> parseList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private Set<String> lessonIds(Course course) {
        Set<String> ids = new LinkedHashSet<>();
        for (Map<String, Object> chapter : courseResponseMapper.parseObjectList(course.getChapters())) {
            if (!(chapter.get("lessons") instanceof List<?> lessons)) continue;
            for (Object lessonValue : lessons) {
                if (lessonValue instanceof Map<?, ?> lesson
                        && lesson.get("id") instanceof String id && !id.isBlank()) {
                    ids.add(id);
                }
            }
        }
        return ids;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to serialize progress", ex);
        }
    }
}
