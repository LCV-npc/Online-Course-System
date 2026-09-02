package com.edupro.dto;

import com.edupro.entity.User;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;

    @Data
    @AllArgsConstructor
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private String avatar;
        private String role;
        private String joinedDate;

        public static UserDto from(User u) {
            return new UserDto(
                u.getId(), u.getName(), u.getEmail(), u.getAvatar(),
                u.getRole().name(),
                u.getJoinedDate() != null ? u.getJoinedDate().toString() : ""
            );
        }
    }
}
