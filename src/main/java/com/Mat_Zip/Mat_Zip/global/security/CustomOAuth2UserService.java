package com.Mat_Zip.Mat_Zip.global.security;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @SuppressWarnings("unchecked")
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        OAuthUserInfo userInfo = switch (registrationId) {
            case "kakao" -> extractKakao(attributes);
            case "naver" -> extractNaver(attributes);
            default -> throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        };

        User user = userRepository.findByProviderAndProviderId(registrationId, userInfo.providerId())
                .map(existing -> {
                    existing.setNickname(userInfo.nickname());
                    existing.setProfileImage(userInfo.profileImage());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(userInfo.email())
                        .nickname(userInfo.nickname())
                        .profileImage(userInfo.profileImage())
                        .provider(registrationId)
                        .providerId(userInfo.providerId())
                        .build()));

        return new OAuth2UserPrincipal(user, attributes);
    }

    private OAuthUserInfo extractKakao(Map<String, Object> attributes) {
        String providerId = String.valueOf(attributes.get("id"));
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount == null) {
            return new OAuthUserInfo(providerId, "카카오사용자", null, null);
        }
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        String nickname = profile != null ? (String) profile.get("nickname") : null;
        String profileImage = profile != null ? (String) profile.get("profile_image_url") : null;
        return new OAuthUserInfo(
                providerId,
                nickname != null ? nickname : "카카오사용자",
                (String) kakaoAccount.get("email"),
                profileImage
        );
    }

    private OAuthUserInfo extractNaver(Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) {
            throw new OAuth2AuthenticationException("네이버 응답에서 사용자 정보를 가져올 수 없습니다.");
        }
        String nickname = (String) response.get("name");
        return new OAuthUserInfo(
                (String) response.get("id"),
                nickname != null ? nickname : "네이버사용자",
                (String) response.get("email"),
                (String) response.get("profile_image")
        );
    }

    private record OAuthUserInfo(String providerId, String nickname, String email, String profileImage) {}
}
