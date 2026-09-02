package com.edupro.repository;

import com.edupro.entity.LessonSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonSubmissionRepository extends JpaRepository<LessonSubmission, String> {
    List<LessonSubmission> findByCourseIdOrderBySubmittedAtDesc(String courseId);
    List<LessonSubmission> findByCourseIdInOrderBySubmittedAtDesc(List<String> courseIds);
    List<LessonSubmission> findAllByOrderBySubmittedAtDesc();
    List<LessonSubmission> findByUserIdAndCourseId(String userId, String courseId);
    boolean existsByUserIdAndCourseIdAndLessonId(String userId, String courseId, String lessonId);
}
