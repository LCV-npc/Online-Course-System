package com.edupro.security;

import com.edupro.entity.User;
import com.edupro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String email;
        String name;
        String avatar;

        if ("google".equals(registrationId)) {
            email = (String) attrs.get("email");
            name  = (String) attrs.get("name");
            avatar = (String) attrs.get("picture");
        } else {
            // facebook
            email = (String) attrs.get("email");
            name  = (String) attrs.get("name");
            Map<String, Object> picture = (Map<String, Object>) attrs.get("picture");
            avatar = picture != null ? (String) ((Map<?, ?>) picture.get("data")).get("url") : "";
        }

        if (email == null) email = registrationId + "_" + oAuth2User.getName() + "@oauth.local";

        final String finalEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setId("u_oauth_" + System.currentTimeMillis());
            newUser.setEmail(finalEmail);
            newUser.setName(name != null ? name : "Người dùng");
            newUser.setAvatar(avatar != null ? avatar : "");
            newUser.setPasswordHash("OAUTH2_NO_PASSWORD");
            newUser.setRole(User.Role.student);
            newUser.setJoinedDate(LocalDate.now());
            return userRepository.save(newUser);
        });

        // Update name/avatar if changed
        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
            userRepository.save(user);
        }

        return new OAuth2UserPrincipal(user, attrs);
    }
}
