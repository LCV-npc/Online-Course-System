package com.edupro.repository;

import com.edupro.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    List<Enrollment> findByUserId(String userId);
    Optional<Enrollment> findByUserIdAndCourseId(String userId, String courseId);
    boolean existsByUserIdAndCourseId(String userId, String courseId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.completed = true")
    long countCompleted();

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.courseId = :courseId")
    long countByCourseId(String courseId);

    void deleteByUserId(String userId);
}
