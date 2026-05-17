package com.Mat_Zip.Mat_Zip.domain.restaurant.controller;

import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantRequest;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantResponse;
import com.Mat_Zip.Mat_Zip.domain.restaurant.service.RestaurantService;
import com.Mat_Zip.Mat_Zip.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<Page<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String priceRange,
            @RequestParam(required = false) String atmosphere,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(restaurantService.searchRestaurants(keyword, pageable));
        }
        if (priceRange != null || atmosphere != null || categoryId != null) {
            return ResponseEntity.ok(restaurantService.getByFilters(priceRange, atmosphere, categoryId, pageable));
        }
        return ResponseEntity.ok(restaurantService.getRestaurants(pageable));
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<RestaurantResponse>> getNearby(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "3.0") double radius,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(restaurantService.getNearby(lat, lng, radius, pageable));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<Page<RestaurantResponse>> getTopRated(
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(restaurantService.getTopRated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        // 로그인 사용자는 최근 조회 기록
        if (userId != null) restaurantService.recordRecentView(userId, id);
        return ResponseEntity.ok(restaurantService.getRestaurant(id, userId));
    }

    @PostMapping
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurant(request, userDetails.getId()));
    }
}
