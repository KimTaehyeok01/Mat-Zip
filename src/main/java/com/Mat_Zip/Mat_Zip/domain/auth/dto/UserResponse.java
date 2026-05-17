package com.Mat_Zip.Mat_Zip.domain.auth.dto;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String address;
    private String profileImage;
    private String role;
    private String provider;

    public static UserResponse from(User user) {
        return from(user, null);
    }

    public static UserResponse from(User user, String address) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .address(address)
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
