package com.edupro.repository;

import com.edupro.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    Optional<UserActivity> findByUserIdAndActivityDate(String userId, LocalDate activityDate);
    List<UserActivity> findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(String userId, LocalDate startDate, LocalDate endDate);
}
