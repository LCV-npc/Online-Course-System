package com.edupro.config;

import com.edupro.entity.User;
import com.edupro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin.enabled:false}")
    private boolean enabled;

    @Value("${app.seed-admin.email:}")
    private String adminEmail;

    @Value("${app.seed-admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (!enabled) {
            log.info("Admin account seeding is disabled");
            return;
        }

        String normalizedEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        if (normalizedEmail.isBlank() || adminPassword == null || adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters are required when admin seeding is enabled");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.info("Admin seed account already exists: {}", normalizedEmail);
            return;
        }

        User admin = new User();
        admin.setId("u_admin_001");
        admin.setName("Admin EduPro");
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=admin");
        admin.setRole(User.Role.admin);
        admin.setJoinedDate(LocalDate.now());
        userRepository.save(admin);
        log.info("Created configured admin seed account: {}", normalizedEmail);
    }
}
