package com.edupro.controller;

import com.edupro.entity.Course;
import com.edupro.entity.User;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.InstructorRepository;
import com.edupro.service.CourseResponseMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InstructorRepository instructorRepository;
    private final ObjectMapper objectMapper;
    private final CourseResponseMapper courseResponseMapper;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String instructorId,
            @AuthenticationPrincipal User user) {

        String qParam = (q != null && !q.isBlank()) ? q : null;
        String catParam = (category != null && !category.isBlank() && !"Tất cả".equals(category)) ? category : null;
        String insParam = (instructorId != null && !instructorId.isBlank()) ? instructorId : null;

        List<Course> courses = courseRepository.searchCourses(qParam, catParam, insParam);

        // Sort
        String sortKey = sort != null ? sort : "popular";
        switch (sortKey) {
            case "rating"     -> courses.sort(Comparator.comparing(Course::getRating, Comparator.reverseOrder())
                                              .thenComparing(Course::getTotalStudents, Comparator.reverseOrder()));
            case "price_asc"  -> courses.sort(Comparator.comparingInt(c -> effectivePrice((Course) c)));
            case "price_desc" -> courses.sort((a, b) -> effectivePrice(b) - effectivePrice(a));
            case "newest"     -> courses.sort(Comparator.comparing(
                                    c -> c.getLastUpdated() != null ? c.getLastUpdated() : LocalDate.MIN,
                                    Comparator.reverseOrder()));
            case "title"      -> courses.sort(Comparator.comparing(Course::getTitle));
            default           -> courses.sort(Comparator.comparing(Course::getTotalStudents, Comparator.reverseOrder()));
        }

        boolean includeRestrictedContent = user != null && user.getRole() == User.Role.admin;
        return ResponseEntity.ok(courses.stream()
                .map(course -> courseResponseMapper.toMap(course, includeRestrictedContent))
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id,
                                    @AuthenticationPrincipal User user) {
        return courseRepository.findById(id)
                .map(c -> {
                    boolean canViewContent = user != null && (
                            user.getRole() == User.Role.admin
                            || (user.getRole() == User.Role.instructor && user.getId().equals(c.getInstructorId()))
                            || enrollmentRepository.existsByUserIdAndCourseId(user.getId(), c.getId()));
                    return ResponseEntity.ok(courseResponseMapper.toMap(c, canViewContent));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Course c = buildCourse(null, body);
        validateCourse(c);
        courseRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseResponseMapper.toMap(c, true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return courseRepository.findById(id).map(existing -> {
            Course updated = buildCourse(existing, body);
            validateCourse(updated);
            courseRepository.save(updated);
            return ResponseEntity.ok(courseResponseMapper.toMap(updated, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(@PathVariable String id,
                                       @RequestBody Map<String, Object> body,
                                       @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        var enrOpt = enrollmentRepository.findByUserIdAndCourseId(user.getId(), id);
        if (enrOpt.isEmpty() || !Boolean.TRUE.equals(enrOpt.get().getCompleted())) {
            return ResponseEntity.status(403).body(Map.of("error","Chỉ học viên đã hoàn thành mới được đánh giá"));
        }
        return courseRepository.findById(id).map(course -> {
            try {
                Number ratingValue = body.get("rating") instanceof Number number ? number : null;
                double rating = ratingValue != null ? ratingValue.doubleValue() : 0;
                String comment = body.get("comment") != null ? String.valueOf(body.get("comment")).trim() : "";
                if (rating < 1 || rating > 5) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
                }
                if (comment.isBlank() || comment.length() > 2000) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Comment must contain 1 to 2000 characters"));
                }

                List<Map<String,Object>> reviews = courseResponseMapper.parseObjectList(course.getReviews());
                if (reviews.stream().anyMatch(review -> user.getId().equals(String.valueOf(review.get("userId"))))) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("error", "You have already reviewed this course"));
                }
                Map<String,Object> review = new LinkedHashMap<>();
                review.put("id", "r_" + UUID.randomUUID());
                review.put("userId", user.getId());
                review.put("userName", user.getName());
                review.put("userAvatar", user.getAvatar() != null ? user.getAvatar() : "");
                review.put("rating", rating);
                review.put("comment", comment);
                review.put("date", LocalDate.now().toString());
                reviews.add(review);
                double avg = reviews.stream().mapToDouble(r -> ((Number) r.get("rating")).doubleValue()).average().orElse(0);
                course.setReviews(objectMapper.writeValueAsString(reviews));
                course.setRating(java.math.BigDecimal.valueOf(Math.round(avg * 10) / 10.0));
                courseRepository.save(course);
                return ResponseEntity.status(201).body(courseResponseMapper.toMap(course, true));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Unable to save review"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ──────────────────── helpers ────────────────────

    private Course buildCourse(Course existing, Map<String, Object> b) {
        Course c = existing != null ? existing : new Course();
        if (existing == null) c.setId("c_" + UUID.randomUUID());
        if (b.containsKey("title")) c.setTitle(b.get("title") != null ? String.valueOf(b.get("title")) : null);
        if (b.containsKey("description")) c.setDescription(b.get("description") != null ? String.valueOf(b.get("description")) : null);
        if (b.containsKey("shortDesc")) c.setShortDesc(b.get("shortDesc") != null ? String.valueOf(b.get("shortDesc")) : null);
        if (b.containsKey("instructorId")) c.setInstructorId(b.get("instructorId") != null ? String.valueOf(b.get("instructorId")) : null);
        if (b.containsKey("price")) c.setPrice(b.get("price") != null ? ((Number) b.get("price")).intValue() : 0);
        if (b.containsKey("discountPrice")) c.setDiscountPrice(b.get("discountPrice") != null ? ((Number) b.get("discountPrice")).intValue() : null);
        if (b.containsKey("thumbnail")) c.setThumbnail(b.get("thumbnail") != null ? String.valueOf(b.get("thumbnail")) : null);
        if (b.containsKey("category")) c.setCategory(b.get("category") != null ? String.valueOf(b.get("category")) : null);
        if (b.containsKey("level")) c.setLevel(b.get("level") != null ? String.valueOf(b.get("level")) : null);
        if (b.containsKey("duration")) c.setDuration(b.get("duration") != null ? String.valueOf(b.get("duration")) : null);
        if (b.containsKey("language")) c.setLanguage(b.get("language") != null ? String.valueOf(b.get("language")) : null);
        if (b.containsKey("certificate")) c.setCertificate(!Boolean.FALSE.equals(b.get("certificate")));
        if (b.containsKey("lastUpdated") && b.get("lastUpdated") != null) {
            try { c.setLastUpdated(LocalDate.parse(String.valueOf(b.get("lastUpdated")))); } catch (Exception ignored) {}
        }
        try {
            if (b.containsKey("tags")) c.setTags(objectMapper.writeValueAsString(b.get("tags")));
            if (b.containsKey("chapters")) {
                String chapStr = objectMapper.writeValueAsString(b.get("chapters"));
                c.setChapters(chapStr);
                List<?> chaps = (List<?>) b.get("chapters");
                int totalLessons = chaps.stream().mapToInt(ch -> {
                    if (ch instanceof Map<?,?> m && m.get("lessons") instanceof List<?> l) return l.size();
                    return 0;
                }).sum();
                c.setTotalLessons(totalLessons);
            }
            if (b.containsKey("reviews")) c.setReviews(objectMapper.writeValueAsString(b.get("reviews")));
            if (b.containsKey("requirements")) c.setRequirements(objectMapper.writeValueAsString(b.get("requirements")));
            if (b.containsKey("objectives")) c.setObjectives(objectMapper.writeValueAsString(b.get("objectives")));
        } catch (Exception ignored) {}
        if (c.getChapters() == null) c.setChapters("[]");
        if (c.getCategory() == null) c.setCategory("Lập trình");
        if (c.getLevel() == null) c.setLevel("Cơ bản");
        if (c.getLastUpdated() == null) c.setLastUpdated(LocalDate.now());
        return c;
    }

    private void validateCourse(Course course) {
        if (course.getTitle() == null || course.getTitle().isBlank()) {
            throw new IllegalArgumentException("Course title is required");
        }
        if (course.getInstructorId() == null || !instructorRepository.existsById(course.getInstructorId())) {
            throw new IllegalArgumentException("A valid instructorId is required");
        }
        if (course.getPrice() == null || course.getPrice() < 0) {
            throw new IllegalArgumentException("Price must be zero or greater");
        }
        if (course.getDiscountPrice() != null
                && (course.getDiscountPrice() < 0 || course.getDiscountPrice() > course.getPrice())) {
            throw new IllegalArgumentException("Discount price must be between zero and the regular price");
        }
    }

    private int effectivePrice(Course c) {
        return c.getDiscountPrice() != null ? c.getDiscountPrice() : (c.getPrice() != null ? c.getPrice() : 0);
    }
}
