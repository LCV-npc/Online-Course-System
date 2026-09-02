package com.edupro.controller;

import com.edupro.entity.*;
import com.edupro.repository.*;
import com.edupro.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor")
@PreAuthorize("hasRole('INSTRUCTOR')")
@RequiredArgsConstructor
public class InstructorController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonSubmissionRepository submissionRepository;
    private final InstructorRepository instructorRepository;
    private final GradingService gradingService;

    private List<String> getAccessibleCourseIds(String instructorId) {
        return courseRepository.findByInstructorId(instructorId)
                .stream().map(Course::getId).toList();
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getInstructorCourses(@AuthenticationPrincipal User user) {
        String instructorId = user.getId();
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> submissions(@AuthenticationPrincipal User user,
                                         @RequestParam(required = false) String courseId) {
        String instructorId = user.getId();

        List<String> instructorCourseIds = getAccessibleCourseIds(instructorId);

        if (instructorCourseIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<LessonSubmission> subs;
        if (courseId != null && !courseId.isBlank()) {
            if (!instructorCourseIds.contains(courseId)) {
                return ResponseEntity.ok(List.of());
            }
            subs = submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId);
        } else {
            subs = submissionRepository.findByCourseIdInOrderBySubmittedAtDesc(instructorCourseIds);
        }

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
    @Transactional
    public ResponseEntity<?> gradeSubmission(@AuthenticationPrincipal User user,
                                             @PathVariable String id,
                                             @RequestBody Map<String, Object> body) {
        String instructorId = user.getId();
        List<String> instructorCourseIds = getAccessibleCourseIds(instructorId);

        return submissionRepository.findById(id).map(s -> {
            if (!instructorCourseIds.contains(s.getCourseId())) {
                return ResponseEntity.status(403).build();
            }

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
}
