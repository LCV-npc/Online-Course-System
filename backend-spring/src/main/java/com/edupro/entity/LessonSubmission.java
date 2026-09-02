package com.edupro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonSubmission {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "course_id", nullable = false, length = 64)
    private String courseId;

    @Column(name = "lesson_id", nullable = false, length = 64)
    private String lessonId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
}
