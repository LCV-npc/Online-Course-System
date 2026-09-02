package com.edupro.controller;

import com.edupro.entity.Course;
import com.edupro.entity.LessonSubmission;
import com.edupro.entity.User;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.CertificateRepository;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.InstructorRepository;
import com.edupro.repository.LessonSubmissionRepository;
import com.edupro.repository.NotificationRepository;
import com.edupro.repository.UserRepository;
import com.edupro.service.GradingService;
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
class InstructorControllerSecurityTest {

    @Mock UserRepository userRepository;
    @Mock CourseRepository courseRepository;
    @Mock LessonSubmissionRepository submissionRepository;
    @Mock InstructorRepository instructorRepository;
    @Mock EnrollmentRepository enrollmentRepository;
    @Mock CertificateRepository certificateRepository;
    @Mock NotificationRepository notificationRepository;

    @Test
    void instructorCannotGradeAnotherInstructorsCourse() {
        GradingService gradingService = new GradingService(
                submissionRepository, enrollmentRepository, certificateRepository,
                courseRepository, notificationRepository);
        InstructorController controller = new InstructorController(
                userRepository, courseRepository, submissionRepository, instructorRepository, gradingService);
        User instructor = new User();
        instructor.setId("instructor-1");
        instructor.setRole(User.Role.instructor);

        Course owned = new Course();
        owned.setId("course-owned");
        owned.setInstructorId("instructor-1");
        when(courseRepository.findByInstructorId("instructor-1")).thenReturn(List.of(owned));

        LessonSubmission foreignSubmission = new LessonSubmission();
        foreignSubmission.setId("submission-1");
        foreignSubmission.setCourseId("course-foreign");
        when(submissionRepository.findById("submission-1")).thenReturn(Optional.of(foreignSubmission));

        var response = controller.gradeSubmission(
                instructor, "submission-1", Map.of("score", 90));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(submissionRepository, never()).save(any());
    }
}
