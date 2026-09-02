package com.edupro.controller;

import com.edupro.entity.CartItem;
import com.edupro.entity.Course;
import com.edupro.entity.Enrollment;
import com.edupro.entity.Notification;
import com.edupro.entity.User;
import com.edupro.repository.CartItemRepository;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.EnrollmentRepository;
import com.edupro.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartItemRepository.findByUserIdOrderByAddedAtDesc(user.getId())
                .stream().map(item -> Map.of(
                        "courseId", item.getCourseId(),
                        "addedAt", item.getAddedAt().toString()
                )).toList());
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body,
                                       @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.student) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only students can use the cart"));
        }
        String courseId = body.get("courseId") != null ? String.valueOf(body.get("courseId")) : "";
        if (!courseRepository.existsById(courseId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Course not found"));
        }
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You are already enrolled in this course"));
        }
        CartItem.CartItemId itemId = new CartItem.CartItemId(user.getId(), courseId);
        if (cartItemRepository.existsById(itemId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Course is already in the cart"));
        }

        cartItemRepository.save(new CartItem(user.getId(), courseId, LocalDateTime.now()));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }

    @DeleteMapping("/{courseId}")
    @Transactional
    public ResponseEntity<?> removeFromCart(@PathVariable String courseId,
                                            @AuthenticationPrincipal User user) {
        cartItemRepository.deleteByUserIdAndCourseId(user.getId(), courseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.student) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only students can checkout"));
        }

        List<CartItem> items = cartItemRepository.findByUserIdOrderByAddedAtDesc(user.getId());
        if (items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        int count = 0;
        LocalDate today = LocalDate.now();
        for (CartItem item : items) {
            String courseId = item.getCourseId();
            if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) continue;
            Course course = courseRepository.findById(courseId).orElse(null);
            if (course == null) continue;

            Enrollment enrollment = new Enrollment();
            enrollment.setId("enr_" + UUID.randomUUID());
            enrollment.setUserId(user.getId());
            enrollment.setCourseId(courseId);
            enrollment.setEnrolledDate(today);
            enrollment.setCompletedLessons("[]");
            enrollment.setLastAccessedLesson("");
            enrollment.setCompleted(false);
            enrollmentRepository.save(enrollment);

            course.setTotalStudents((course.getTotalStudents() != null ? course.getTotalStudents() : 0) + 1);
            courseRepository.save(course);
            count++;
        }

        cartItemRepository.deleteByUserId(user.getId());
        if (count == 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "No cart item could be enrolled"));
        }

        Notification notification = new Notification();
        notification.setId("n_" + UUID.randomUUID());
        notification.setUserId(user.getId());
        notification.setTitle("Đăng ký thành công!");
        notification.setMessage("Bạn đã đăng ký " + count + " khóa học. Chúc bạn học tốt!");
        notification.setType(Notification.NotifType.success);
        notification.setDate(today);
        notification.setReadFlag(false);
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "count", count,
                "paymentMode", "DEMO_NO_PROVIDER"));
    }
}
