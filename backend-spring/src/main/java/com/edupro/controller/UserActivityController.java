package com.edupro.controller;

import com.edupro.entity.User;
import com.edupro.entity.UserActivity;
import com.edupro.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class UserActivityController {

    private final UserActivityRepository activityRepository;

    @PostMapping("/log")
    public ResponseEntity<?> logActivity(@AuthenticationPrincipal User user, @RequestBody Map<String, Integer> body) {
        if (user == null) return ResponseEntity.status(401).build();

        int minutes = body.getOrDefault("minutes", 0);
        if (minutes <= 0) return ResponseEntity.ok(Map.of("message", "No activity to log"));

        LocalDate today = LocalDate.now();
        UserActivity activity = activityRepository.findByUserIdAndActivityDate(user.getId(), today)
                .orElseGet(() -> {
                    UserActivity newActivity = new UserActivity();
                    newActivity.setUserId(user.getId());
                    newActivity.setActivityDate(today);
                    newActivity.setStudyMinutes(0);
                    return newActivity;
                });

        activity.setStudyMinutes(activity.getStudyMinutes() + minutes);
        activityRepository.save(activity);

        return ResponseEntity.ok(Map.of("message", "Logged successfully", "totalMinutesToday", activity.getStudyMinutes()));
    }

    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyActivity(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();

        LocalDate today = LocalDate.now();
        // Lấy từ Thứ 2 đến Thứ 7, CN hoặc lấy theo 7 ngày gần nhất
        // Để khớp với UI "T2, T3..." thông thường, có hai cách: 
        // 1. Phân tích ngày gần nhất. Giao diện frontend sẽ tự sắp xếp
        // 2. Trả về đúng 7 ngày gần nhất

        LocalDate startDate = today.minusDays(6);
        List<UserActivity> activities = activityRepository.findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(user.getId(), startDate, today);

        List<Map<String, Object>> result = new ArrayList<>();
        
        String[] daysOfWeek = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};

        for (int i = 0; i <= 6; i++) {
            LocalDate d = startDate.plusDays(i);
            int dayOfWeekValue = d.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
            String dayLabel = dayOfWeekValue == 7 ? "CN" : "T" + (dayOfWeekValue + 1);

            int minutes = activities.stream()
                .filter(a -> a.getActivityDate().equals(d))
                .findFirst()
                .map(UserActivity::getStudyMinutes)
                .orElse(0);

            Map<String, Object> dayData = new LinkedHashMap<>();
            dayData.put("day", dayLabel);
            dayData.put("date", d.toString());
            dayData.put("minutes", minutes);
            result.add(dayData);
        }

        return ResponseEntity.ok(result);
    }
}
