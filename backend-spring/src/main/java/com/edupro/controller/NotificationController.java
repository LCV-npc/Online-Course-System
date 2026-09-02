package com.edupro.controller;

import com.edupro.entity.Notification;
import com.edupro.entity.User;
import com.edupro.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toMap).toList());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id,
                                      @AuthenticationPrincipal User user) {
        return notificationRepository.findById(id)
                .filter(n -> n.getUserId().equals(user.getId()))
                .map(n -> {
                    n.setReadFlag(true);
                    notificationRepository.save(n);
                    return ResponseEntity.ok(toMap(n));
                }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(Notification n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("userId", n.getUserId());
        m.put("title", n.getTitle());
        m.put("message", n.getMessage());
        m.put("type", n.getType().name());
        m.put("date", n.getDate() != null ? n.getDate().toString() : "");
        m.put("read", n.getReadFlag());
        return m;
    }
}
