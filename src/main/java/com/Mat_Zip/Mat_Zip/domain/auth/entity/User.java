package com.Mat_Zip.Mat_Zip.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(nullable = false, length = 100)
    private String nickname;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "ROLE_USER";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String provider = "local";

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
