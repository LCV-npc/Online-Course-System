package com.edupro.controller;

import com.edupro.entity.Certificate;
import com.edupro.entity.Course;
import com.edupro.entity.User;
import com.edupro.repository.CertificateRepository;
import com.edupro.repository.CourseRepository;
import com.edupro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> myCertificates(@AuthenticationPrincipal User user) {
        List<Certificate> certs = certificateRepository.findByUserId(user.getId());
        return ResponseEntity.ok(certs.stream().map(c -> toMap(c, user)).toList());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCertificate(@PathVariable String courseId,
                                            @AuthenticationPrincipal User user) {
        return certificateRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .map(c -> ResponseEntity.ok(toMap(c, user)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(Certificate c, User user) {
        Course course = courseRepository.findById(c.getCourseId()).orElse(null);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("userId", c.getUserId());
        m.put("courseId", c.getCourseId());
        m.put("issuedDate", c.getIssuedDate() != null ? c.getIssuedDate().toString() : "");
        m.put("userName", user.getName());
        m.put("courseTitle", course != null ? course.getTitle() : "");
        return m;
    }
}
