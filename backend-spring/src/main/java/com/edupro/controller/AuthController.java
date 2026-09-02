package com.edupro.controller;

import com.edupro.dto.AuthResponse;
import com.edupro.dto.LoginRequest;
import com.edupro.dto.RegisterRequest;
import com.edupro.entity.User;
import com.edupro.repository.UserRepository;
import com.edupro.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email đã được sử dụng"));
        }

        String avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email;
        User user = new User();
        user.setId("u_" + UUID.randomUUID());
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setAvatar(avatar);
        user.setRole(User.Role.student);
        user.setJoinedDate(LocalDate.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, AuthResponse.UserDto.from(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        return userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(req.getPassword(), u.getPasswordHash()))
                .<ResponseEntity<?>>map(u -> {
                    String token = jwtUtil.generateToken(u.getId(), u.getRole().name());
                    return ResponseEntity.ok(new AuthResponse(token, AuthResponse.UserDto.from(u)));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
        return ResponseEntity.ok(AuthResponse.UserDto.from(user));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
