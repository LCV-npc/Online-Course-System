package com.edupro.controller;

import com.edupro.entity.Course;
import com.edupro.entity.Enrollment;
import com.edupro.entity.User;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.InstructorRepository;
import com.edupro.repository.LessonSubmissionRepository;
import com.edupro.service.CourseResponseMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentControllerSecurityTest {

    @Mock EnrollmentRepository enrollmentRepository;
    @Mock CourseRepository courseRepository;
    @Mock LessonSubmissionRepository submissionRepository;
    @Mock InstructorRepository instructorRepository;

    private EnrollmentController controller;
    private User student;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        controller = new EnrollmentController(
                enrollmentRepository,
                courseRepository,
                submissionRepository,
                instructorRepository,
                objectMapper,
                new CourseResponseMapper(objectMapper));
        student = new User();
        student.setId("student-1");
        student.setRole(User.Role.student);
    }

    @Test
    void studentCannotSetOwnGradeOrCompletion() {
        var response = controller.updateProgress(
                "course-1", Map.of("completed", true, "grade", 100), student);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void enrollmentRequiresAnExistingCourse() {
        when(courseRepository.findById("missing")).thenReturn(Optional.empty());

        var response = controller.enroll(Map.of("courseId", "missing"), student);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void courseContentRequiresEnrollment() {
        Course course = courseWithLessons("lesson-1");
        when(courseRepository.findById("course-1")).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByUserIdAndCourseId("student-1", "course-1")).thenReturn(false);

        var response = controller.courseContent("course-1", student);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void gradingRequestRequiresEveryCourseLesson() {
        Course course = courseWithLessons("lesson-1", "lesson-2");
        Enrollment enrollment = new Enrollment();
        enrollment.setUserId("student-1");
        enrollment.setCourseId("course-1");
        enrollment.setCompletedLessons("[\"lesson-1\"]");
        when(enrollmentRepository.findByUserIdAndCourseId("student-1", "course-1"))
                .thenReturn(Optional.of(enrollment));
        when(courseRepository.findById("course-1")).thenReturn(Optional.of(course));

        var response = controller.submitForGrading("course-1", Map.of(), student);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        verify(submissionRepository, never()).save(any());
    }

    private Course courseWithLessons(String... ids) {
        Course course = new Course();
        course.setId("course-1");
        course.setInstructorId("instructor-1");
        List<Map<String, Object>> lessons = java.util.Arrays.stream(ids)
                .map(id -> Map.<String, Object>of("id", id, "title", id))
                .toList();
        try {
            course.setChapters(new ObjectMapper().writeValueAsString(
                    List.of(Map.of("id", "chapter-1", "title", "Chapter", "lessons", lessons))));
        } catch (Exception ex) {
            throw new AssertionError(ex);
        }
        return course;
    }
}
