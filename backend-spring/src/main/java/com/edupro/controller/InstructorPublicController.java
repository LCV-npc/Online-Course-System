package com.edupro.controller;

import com.edupro.entity.Course;
import com.edupro.entity.Instructor;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.InstructorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorPublicController {

    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<?> getAllInstructors() {
        List<Instructor> instructors = instructorRepository.findAll();
        List<Map<String, Object>> result = instructors.stream().map(ins -> {
            // Tính số học viên thực tế từ enrollments
            List<Course> courses = courseRepository.findByInstructorId(ins.getId());
            long studentCount = courses.stream()
                    .mapToLong(c -> enrollmentRepository.countByCourseId(c.getId()))
                    .sum();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ins.getId());
            m.put("name", ins.getName());
            m.put("email", ins.getEmail());
            m.put("avatar", ins.getAvatar());
            m.put("bio", ins.getBio());
            m.put("specialty", ins.getSpecialty());
            m.put("rating", ins.getRating());
            m.put("students", studentCount); // Luôn chính xác từ DB
            m.put("experience", ins.getExperience());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInstructorById(@PathVariable String id) {
        return instructorRepository.findById(id).map(ins -> {
            List<Course> courses = courseRepository.findByInstructorId(ins.getId());
            long studentCount = courses.stream()
                    .mapToLong(c -> enrollmentRepository.countByCourseId(c.getId()))
                    .sum();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ins.getId());
            m.put("name", ins.getName());
            m.put("email", ins.getEmail());
            m.put("avatar", ins.getAvatar());
            m.put("bio", ins.getBio());
            m.put("specialty", ins.getSpecialty());
            m.put("rating", ins.getRating());
            m.put("students", studentCount);
            m.put("experience", ins.getExperience());
            return ResponseEntity.ok((Object) m);
        }).orElse(ResponseEntity.notFound().build());
    }
}
