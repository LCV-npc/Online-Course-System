package com.edupro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "enrollments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","course_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "course_id", nullable = false, length = 64)
    private String courseId;

    @Column(name = "enrolled_date", nullable = false)
    private LocalDate enrolledDate;

    @Column(name = "completed_lessons", columnDefinition = "JSON", nullable = false)
    private String completedLessons = "[]";

    @Column(name = "last_accessed_lesson", length = 64)
    private String lastAccessedLesson = "";

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    private Integer grade;
}
