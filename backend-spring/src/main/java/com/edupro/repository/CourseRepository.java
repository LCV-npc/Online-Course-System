package com.edupro.repository;

import com.edupro.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, String> {

    boolean existsByInstructorId(String instructorId);

    List<Course> findByInstructorId(String instructorId);
    
    List<Course> findByCategory(String category);

    @Query("SELECT c FROM Course c WHERE " +
           "(:q IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%',:q,'%')) " +
           " OR LOWER(c.description) LIKE LOWER(CONCAT('%',:q,'%')) " +
           " OR LOWER(c.shortDesc) LIKE LOWER(CONCAT('%',:q,'%'))) " +
           "AND (:category IS NULL OR c.category = :category) " +
           "AND (:instructorId IS NULL OR c.instructorId = :instructorId)")
    List<Course> searchCourses(@Param("q") String q,
                                @Param("category") String category,
                                @Param("instructorId") String instructorId);
}
