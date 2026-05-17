package com.Mat_Zip.Mat_Zip.domain.review.entity;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Short rating;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    // GPS 인증 여부
    @Column(name = "visit_verified", nullable = false)
    @Builder.Default
    private boolean visitVerified = false;

    // 영수증 이미지 URL
    @Column(name = "receipt_image", length = 500)
    private String receiptImage;

    // 인증 유형: NONE / GPS / RECEIPT / BOTH
    @Column(name = "verification_type", length = 20, nullable = false)
    @Builder.Default
    private String verificationType = "NONE";

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReviewImage> images = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
