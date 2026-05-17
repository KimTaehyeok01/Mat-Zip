package com.Mat_Zip.Mat_Zip.domain.review.service;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.UserRepository;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import com.Mat_Zip.Mat_Zip.domain.restaurant.repository.RestaurantRepository;
import com.Mat_Zip.Mat_Zip.domain.review.dto.ReviewRequest;
import com.Mat_Zip.Mat_Zip.domain.review.dto.ReviewResponse;
import com.Mat_Zip.Mat_Zip.domain.review.entity.Review;
import com.Mat_Zip.Mat_Zip.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Value("${app.server-url:http://localhost:8080}")
    private String serverUrl;

    // GPS 인증 반경 (500m)
    private static final double VERIFY_RADIUS_KM = 0.5;

    public Page<ReviewResponse> getReviewsByRestaurant(Long restaurantId, Pageable pageable) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId, pageable)
                .map(ReviewResponse::from);
    }

    public Page<ReviewResponse> getMyReviews(Long userId, Pageable pageable) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(ReviewResponse::from);
    }

    @Transactional
    public ReviewResponse createReview(Long restaurantId, ReviewRequest request, Long userId) {
        if (reviewRepository.existsByRestaurantIdAndUserId(restaurantId, userId)) {
            throw new IllegalArgumentException("이미 리뷰를 작성한 식당입니다.");
        }
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("식당을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // GPS 방문 인증
        boolean gpsVerified = false;
        if (request.getUserLat() != null && request.getUserLng() != null) {
            double dist = calcDistanceKm(
                    request.getUserLat().doubleValue(), request.getUserLng().doubleValue(),
                    restaurant.getLatitude().doubleValue(), restaurant.getLongitude().doubleValue());
            gpsVerified = dist <= VERIFY_RADIUS_KM;
        }

        String verificationType = gpsVerified ? "GPS" : "NONE";

        return ReviewResponse.from(reviewRepository.save(Review.builder()
                .restaurant(restaurant).user(user)
                .rating(request.getRating()).content(request.getContent())
                .visitDate(request.getVisitDate())
                .visitVerified(gpsVerified)
                .verificationType(verificationType)
                .build()));
    }

    @Transactional
    public ReviewResponse uploadReceipt(Long reviewId, MultipartFile file, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        try {
            String ext = getExt(file.getOriginalFilename());
            String filename = "receipt_" + UUID.randomUUID() + ext;
            Path dir = Paths.get("uploads/receipts");
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            review.setReceiptImage(serverUrl + "/uploads/receipts/" + filename);

            // 인증 유형 업데이트
            String updated = review.isVisitVerified() ? "BOTH" : "RECEIPT";
            review.setVerificationType(updated);
            review.setVisitVerified(true);

            return ReviewResponse.from(review);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 오류", e);
        }
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("리뷰를 수정할 권한이 없습니다.");
        }
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setVisitDate(request.getVisitDate());
        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("리뷰를 삭제할 권한이 없습니다.");
        }
        reviewRepository.delete(review);
    }

    // 두 좌표 사이 거리 (km) - Haversine 공식
    private double calcDistanceKm(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private String getExt(String filename) {
        if (filename != null && filename.contains("."))
            return filename.substring(filename.lastIndexOf("."));
        return ".jpg";
    }
}
