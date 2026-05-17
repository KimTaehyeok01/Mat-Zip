package com.Mat_Zip.Mat_Zip.domain.review.dto;

import com.Mat_Zip.Mat_Zip.domain.review.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class ReviewResponse {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private Long userId;
    private String userNickname;
    private String userProfileImage;
    private Short rating;
    private String content;
    private LocalDate visitDate;
    private List<String> imageUrls;
    private LocalDateTime createdAt;

    // 인증 관련
    private boolean visitVerified;
    private String receiptImage;
    private String verificationType;  // NONE / GPS / RECEIPT / BOTH

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .restaurantId(r.getRestaurant().getId())
                .restaurantName(r.getRestaurant().getName())
                .userId(r.getUser().getId())
                .userNickname(r.getUser().getNickname())
                .userProfileImage(r.getUser().getProfileImage())
                .rating(r.getRating())
                .content(r.getContent())
                .visitDate(r.getVisitDate())
                .imageUrls(r.getImages().stream().map(img -> img.getImageUrl()).toList())
                .createdAt(r.getCreatedAt())
                .visitVerified(r.isVisitVerified())
                .receiptImage(r.getReceiptImage())
                .verificationType(r.getVerificationType())
                .build();
    }
}
