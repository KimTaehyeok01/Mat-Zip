package com.Mat_Zip.Mat_Zip.domain.auth.controller;

import com.Mat_Zip.Mat_Zip.domain.auth.dto.UserResponse;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.UpdatePasswordRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.UpdateProfileRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.service.UserService;
import com.Mat_Zip.Mat_Zip.domain.bookmark.service.BookmarkService;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantResponse;
import com.Mat_Zip.Mat_Zip.domain.restaurant.service.RestaurantService;
import com.Mat_Zip.Mat_Zip.domain.review.dto.ReviewResponse;
import com.Mat_Zip.Mat_Zip.domain.review.service.ReviewService;
import com.Mat_Zip.Mat_Zip.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ReviewService reviewService;
    private final BookmarkService bookmarkService;
    private final RestaurantService restaurantService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getId()));
    }

    @GetMapping("/me/reviews")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getMyReviews(userDetails.getId(), pageable));
    }

    @GetMapping("/me/bookmarks")
    public ResponseEntity<Page<RestaurantResponse>> getMyBookmarks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(bookmarkService.getBookmarks(userDetails.getId(), pageable));
    }

    @GetMapping("/me/recent-views")
    public ResponseEntity<List<RestaurantResponse>> getRecentViews(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(restaurantService.getRecentViews(userDetails.getId()));
    }

    @PatchMapping("/me/profile-image")
    public ResponseEntity<UserResponse> updateProfileImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.updateProfileImage(userDetails.getId(), file));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.updatePassword(userDetails.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/profile-image")
    public ResponseEntity<UserResponse> resetProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.resetProfileImage(userDetails.getId()));
    }

    @PostMapping("/me/bookmarks/{restaurantId}")
    public ResponseEntity<Void> toggleBookmark(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        bookmarkService.toggle(userDetails.getId(), restaurantId);
        return ResponseEntity.noContent().build();
    }
}
