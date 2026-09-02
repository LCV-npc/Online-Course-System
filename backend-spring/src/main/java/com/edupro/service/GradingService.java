package com.edupro.service;

import com.edupro.entity.Certificate;
import com.edupro.entity.Course;
import com.edupro.entity.LessonSubmission;
import com.edupro.entity.Notification;
import com.edupro.repository.CertificateRepository;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.LessonSubmissionRepository;
import com.edupro.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GradingService {

    private final LessonSubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public LessonSubmission grade(LessonSubmission submission, Integer score, String feedback) {
        if (score == null || score < 0 || score > 100) {
            throw new IllegalArgumentException("Score must be between 0 and 100");
        }

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setGradedAt(LocalDateTime.now());
        LessonSubmission saved = submissionRepository.save(submission);

        if ("course_completion".equals(submission.getLessonId())) {
            completeEnrollment(submission.getUserId(), submission.getCourseId(), score);
        }
        return saved;
    }

    private void completeEnrollment(String userId, String courseId, int finalGrade) {
        enrollmentRepository.findByUserIdAndCourseId(userId, courseId).ifPresent(enrollment -> {
            LocalDate today = LocalDate.now();
            enrollment.setGrade(finalGrade);
            enrollment.setCompleted(true);
            enrollment.setCompletedDate(today);

            String courseTitle = courseRepository.findById(courseId)
                    .map(Course::getTitle).orElse("Khóa học");

            if (finalGrade >= 70 && certificateRepository.findByUserIdAndCourseId(userId, courseId).isEmpty()) {
                certificateRepository.save(new Certificate(
                        "cert_" + UUID.randomUUID(), userId, courseId, today));
            }

            Notification notification = new Notification();
            notification.setId("n_" + UUID.randomUUID());
            notification.setUserId(userId);
            notification.setTitle(finalGrade >= 70 ? "Chúc mừng bạn đã hoàn thành khóa học!" : "Kết quả chấm điểm");
            notification.setMessage(finalGrade >= 70
                    ? "Bạn đạt " + finalGrade + " điểm cho \"" + courseTitle + "\". Chứng chỉ đã được cấp!"
                    : "Bạn đạt " + finalGrade + " điểm cho \"" + courseTitle + "\". Cần tối thiểu 70 điểm để nhận chứng chỉ.");
            notification.setType(finalGrade >= 70 ? Notification.NotifType.success : Notification.NotifType.warning);
            notification.setDate(today);
            notification.setReadFlag(false);
            notificationRepository.save(notification);
            enrollmentRepository.save(enrollment);
        });
    }
}
