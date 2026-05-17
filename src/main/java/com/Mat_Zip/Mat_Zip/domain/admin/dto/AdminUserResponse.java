package com.Mat_Zip.Mat_Zip.domain.admin.dto;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class AdminUserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String profileImage;
    private String role;
    private String provider;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminUserResponse from(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .provider(user.getProvider())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}