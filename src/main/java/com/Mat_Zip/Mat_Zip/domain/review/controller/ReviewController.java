package com.Mat_Zip.Mat_Zip.domain.review.controller;

import com.Mat_Zip.Mat_Zip.domain.review.dto.ReviewRequest;
import com.Mat_Zip.Mat_Zip.domain.review.dto.ReviewResponse;
import com.Mat_Zip.Mat_Zip.domain.review.service.ReviewService;
import com.Mat_Zip.Mat_Zip.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/restaurants/{restaurantId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByRestaurant(restaurantId, pageable));
    }

    @PostMapping("/restaurants/{restaurantId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long restaurantId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(restaurantId, request, userDetails.getId()));
    }

    @PostMapping("/reviews/{reviewId}/receipt")
    public ResponseEntity<ReviewResponse> uploadReceipt(
            @PathVariable Long reviewId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reviewService.uploadReceipt(reviewId, file, userDetails.getId()));
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, request, userDetails.getId()));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        reviewService.deleteReview(reviewId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
