package com.edupro.repository;

import com.edupro.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findByUserId(String userId);
    Optional<Certificate> findByUserIdAndCourseId(String userId, String courseId);
}
