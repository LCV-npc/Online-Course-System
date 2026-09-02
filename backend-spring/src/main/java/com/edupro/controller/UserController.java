package com.edupro.controller;

import com.edupro.entity.User;
import com.edupro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error","Chưa đăng nhập"));
        return ResponseEntity.ok(toMap(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, Object> body,
                                      @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        if (body.containsKey("name")) user.setName(body.get("name") != null ? String.valueOf(body.get("name")) : null);
        if (body.containsKey("avatar")) user.setAvatar(body.get("avatar") != null ? String.valueOf(body.get("avatar")) : null);
        userRepository.save(user);
        return ResponseEntity.ok(toMap(user));
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
            "id", u.getId(),
            "name", u.getName(),
            "email", u.getEmail(),
            "avatar", u.getAvatar() != null ? u.getAvatar() : "",
            "role", u.getRole().name(),
            "joinedDate", u.getJoinedDate() != null ? u.getJoinedDate().toString() : ""
        );
    }
}
