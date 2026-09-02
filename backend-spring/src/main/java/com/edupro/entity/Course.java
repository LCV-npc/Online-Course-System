package com.edupro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_desc", length = 512)
    private String shortDesc;

    @Column(name = "instructor_id", nullable = false, length = 64)
    private String instructorId;

    @Column(nullable = false)
    private Integer price = 0;

    @Column(name = "discount_price")
    private Integer discountPrice;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false, length = 32)
    private String level;

    @Column(length = 32)
    private String duration;

    @Column(name = "total_lessons")
    private Integer totalLessons = 0;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "total_students")
    private Integer totalStudents = 0;

    @Column(length = 32)
    private String language;

    // JSON columns stored as String, parsed in service layer
    @Column(columnDefinition = "JSON")
    private String tags;

    @Column(columnDefinition = "JSON", nullable = false)
    private String chapters;

    @Column(columnDefinition = "JSON")
    private String reviews;

    @Column(columnDefinition = "JSON")
    private String requirements;

    @Column(columnDefinition = "JSON")
    private String objectives;

    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    @Column(nullable = false)
    private Boolean certificate = true;
}
